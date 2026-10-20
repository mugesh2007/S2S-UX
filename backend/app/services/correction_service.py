import re
from typing import Any, Dict, List, Optional, Tuple
from app.core.exceptions import ComponentNotFoundError
from app.schemas.component import ComponentEditRequest, ComponentStyles, UIComponentNode
from app.schemas.correction import NaturalCorrectionRequest, NaturalCorrectionResponse
from app.schemas.interface import InterfaceDocument


class CorrectionService:
    """
    Translates user natural-language instructions (e.g. 'Make the login button blue')
    into strictly validated, allowlisted component property updates.
    Ensures zero arbitrary code execution and targeted node mutations without full-page regeneration.
    """

    COLOR_MAP = {
        "blue": ("bg-blue-600 text-white", "primary"),
        "red": ("bg-red-600 text-white", "danger"),
        "danger": ("bg-red-600 text-white", "danger"),
        "green": ("bg-emerald-600 text-white", "success"),
        "emerald": ("bg-emerald-600 text-white", "success"),
        "purple": ("bg-violet-600 text-white", "secondary"),
        "violet": ("bg-violet-600 text-white", "secondary"),
        "dark": ("bg-slate-900 text-slate-100", "secondary"),
        "slate": ("bg-slate-800 text-slate-100", "secondary"),
        "outline": ("border border-blue-500 text-blue-400 bg-transparent", "outline"),
    }

    @classmethod
    def translate_and_apply(
        cls,
        interface: InterfaceDocument,
        request: NaturalCorrectionRequest,
        project_id: str,
    ) -> Tuple[InterfaceDocument, Dict[str, Any], UIComponentNode, str]:
        """
        Translates natural language into a validated patch and applies it to the target node.
        Returns: (updated_interface, patch_applied, target_node, explanation)
        """
        prompt = request.prompt.strip()
        lower_prompt = prompt.lower()

        # Step 1: Identify target node
        all_nodes: List[UIComponentNode] = []
        def collect_nodes(node: UIComponentNode):
            all_nodes.append(node)
            if node.children:
                for child in node.children:
                    collect_nodes(child)

        collect_nodes(interface)

        target_node: Optional[UIComponentNode] = None
        if request.component_id:
            target_node = next((n for n in all_nodes if n.id == request.component_id), None)
            if not target_node:
                raise ComponentNotFoundError(request.component_id, project_id)
        else:
            # Fuzzy match target node from prompt keywords
            target_node = cls._resolve_target_node(all_nodes, lower_prompt)
            if not target_node:
                # Default to the first button or interactive element if mentioned, else first child
                target_node = next((n for n in all_nodes if n.type.value == "Button"), all_nodes[0])

        # Step 2: Translate instructions into validated property changes
        patch: Dict[str, Any] = {}
        explanations: List[str] = []

        # Check for text/label change
        text_match = re.search(r'(?:change text to|set label to|rename to|call it|title to)\s*[\'"]?([^\'"]+)[\'"]?', prompt, re.IGNORECASE)
        if not text_match:
            # Check for quoted string
            quote_match = re.search(r'[\'"]([^\'"]+)[\'"]', prompt)
            if quote_match and not any(c in quote_match.group(1).lower() for c in cls.COLOR_MAP):
                text_match = quote_match

        if text_match:
            new_text = text_match.group(1).strip()
            # Sanitize text
            new_text = re.sub(r'[<>{}\\]', '', new_text)
            if target_node.type.value in ("Heading", "Text"):
                patch["props"] = {**patch.get("props", {}), "text": new_text}
                explanations.append(f"Updated text to '{new_text}'")
            elif target_node.type.value == "Button":
                patch["props"] = {**patch.get("props", {}), "label": new_text}
                explanations.append(f"Updated button label to '{new_text}'")
            elif target_node.type.value == "Input":
                patch["props"] = {**patch.get("props", {}), "placeholder": new_text}
                explanations.append(f"Updated placeholder to '{new_text}'")
            else:
                patch["name"] = new_text
                explanations.append(f"Updated element name to '{new_text}'")

        # Check for colour changes
        for color_name, (tailwind_cls, variant) in cls.COLOR_MAP.items():
            if color_name in lower_prompt:
                current_classes = target_node.styles.tailwind_classes or ""
                # Strip existing bg- and text- colors
                cleaned = re.sub(r'\b(bg-[a-z0-9\-/]+|text-[a-z0-9\-/]+)\b', '', current_classes).strip()
                new_classes = f"{cleaned} {tailwind_cls}".strip()
                patch["styles"] = {"tailwind_classes": new_classes}
                if target_node.type.value in ("Button", "Badge"):
                    patch["props"] = {**patch.get("props", {}), "variant": variant}
                explanations.append(f"Applied {color_name} color tokens ('{tailwind_cls}')")
                break

        # Check for dimension changes (width/height)
        if "full width" in lower_prompt or "make wide" in lower_prompt or "w-full" in lower_prompt:
            current = (patch.get("styles", {}).get("tailwind_classes") or target_node.styles.tailwind_classes) or ""
            patch["styles"] = {
                "tailwind_classes": f"{re.sub(r'\bw-([a-z0-9/]+)\b', '', current).strip()} w-full".strip()
            }
            explanations.append("Applied full width ('w-full')")
        elif "half width" in lower_prompt or "w-1/2" in lower_prompt:
            current = (patch.get("styles", {}).get("tailwind_classes") or target_node.styles.tailwind_classes) or ""
            patch["styles"] = {
                "tailwind_classes": f"{re.sub(r'\bw-([a-z0-9/]+)\b', '', current).strip()} w-1/2".strip()
            }
            explanations.append("Applied half width ('w-1/2')")
        elif "small" in lower_prompt:
            if target_node.type.value == "Button":
                patch["props"] = {**patch.get("props", {}), "size": "sm"}
                explanations.append("Set button size to small ('sm')")
        elif "large" in lower_prompt or "big" in lower_prompt:
            if target_node.type.value == "Button":
                patch["props"] = {**patch.get("props", {}), "size": "lg"}
                explanations.append("Set button size to large ('lg')")

        # Height changes
        if "tall" in lower_prompt or "h-64" in lower_prompt or "increase height" in lower_prompt:
            current = (patch.get("styles", {}).get("tailwind_classes") or target_node.styles.tailwind_classes) or ""
            patch["styles"] = {
                "tailwind_classes": f"{re.sub(r'\bh-([a-z0-9/\[\]]+)\b', '', current).strip()} h-64".strip()
            }
            explanations.append("Increased height to tall ('h-64')")
        elif "compact height" in lower_prompt or "h-12" in lower_prompt or "reduce height" in lower_prompt:
            current = (patch.get("styles", {}).get("tailwind_classes") or target_node.styles.tailwind_classes) or ""
            patch["styles"] = {
                "tailwind_classes": f"{re.sub(r'\bh-([a-z0-9/\[\]]+)\b', '', current).strip()} h-12".strip()
            }
            explanations.append("Set compact height ('h-12')")
        elif "min height" in lower_prompt or "min-h" in lower_prompt:
            current = (patch.get("styles", {}).get("tailwind_classes") or target_node.styles.tailwind_classes) or ""
            patch["styles"] = {
                "tailwind_classes": f"{current} min-h-[160px]".strip()
            }
            explanations.append("Set minimum height ('min-h-[160px]')")

        # Check for spacing changes (padding / gap / margin)
        if "padding" in lower_prompt:
            if "remove" in lower_prompt or "no" in lower_prompt or "zero" in lower_prompt:
                patch["props"] = {**patch.get("props", {}), "padding": "p-0"}
                explanations.append("Removed padding ('p-0')")
            elif "increase" in lower_prompt or "more" in lower_prompt or "large" in lower_prompt:
                patch["props"] = {**patch.get("props", {}), "padding": "p-8"}
                explanations.append("Increased padding to ('p-8')")
            else:
                patch["props"] = {**patch.get("props", {}), "padding": "p-4"}
                explanations.append("Adjusted padding to ('p-4')")

        if "gap" in lower_prompt:
            if "large" in lower_prompt or "more" in lower_prompt or "increase" in lower_prompt:
                patch["props"] = {**patch.get("props", {}), "gap": "gap-8"}
                explanations.append("Increased item gap to ('gap-8')")
            elif "small" in lower_prompt or "less" in lower_prompt:
                patch["props"] = {**patch.get("props", {}), "gap": "gap-2"}
                explanations.append("Decreased item gap to ('gap-2')")
            else:
                patch["props"] = {**patch.get("props", {}), "gap": "gap-4"}
                explanations.append("Adjusted item gap to ('gap-4')")

        # Check for layout flow
        if "horizontal" in lower_prompt or "side by side" in lower_prompt or "row" in lower_prompt:
            if target_node.type.value in ("Container", "Card"):
                patch["props"] = {**patch.get("props", {}), "layout": "flex-row"}
                explanations.append("Changed container layout to horizontal ('flex-row')")
        elif "vertical" in lower_prompt or "stack" in lower_prompt:
            if target_node.type.value in ("Container", "Card"):
                patch["props"] = {**patch.get("props", {}), "layout": "flex-col"}
                explanations.append("Changed container layout to vertical ('flex-col')")
        elif "3 columns" in lower_prompt or "grid" in lower_prompt:
            if target_node.type.value in ("Container", "Card"):
                patch["props"] = {**patch.get("props", {}), "layout": "grid-3"}
                explanations.append("Changed container layout to 3-column grid ('grid-3')")

        if not patch:
            # Fallback: safe default style highlight if intent was unclassified
            current = target_node.styles.tailwind_classes or ""
            patch["styles"] = {"tailwind_classes": f"{current} border border-blue-500/50".strip()}
            explanations.append(f"Applied visual highlight to '{target_node.name}'")

        # Step 3: Apply the validated patch directly to the target node
        cls._apply_patch_to_node(target_node, patch)

        explanation = "; ".join(explanations)
        return interface, patch, target_node, explanation

    @classmethod
    def _resolve_target_node(cls, nodes: List[UIComponentNode], prompt: str) -> Optional[UIComponentNode]:
        """Resolves target AST node by matching type names and label tokens in prompt."""
        # 1. Exact or partial name match
        for node in nodes:
            if node.name and node.name.lower() in prompt:
                return node

        # 2. Match label/text/title
        for node in nodes:
            label = node.props.get("label") or node.props.get("text") or node.props.get("title")
            if label and isinstance(label, str) and label.lower() in prompt:
                return node

        # 3. Match component type with keyword
        type_keywords = {
            "button": "Button",
            "heading": "Heading",
            "title": "Heading",
            "header": "Heading",
            "input": "Input",
            "text": "Text",
            "card": "Card",
            "container": "Container",
            "navbar": "Navbar",
            "table": "Table",
            "badge": "Badge",
            "avatar": "Avatar",
            "checkbox": "Checkbox",
            "divider": "Divider",
        }

        for kw, comp_type in type_keywords.items():
            if kw in prompt:
                # Find matching type
                candidates = [n for n in nodes if n.type.value == comp_type]
                if candidates:
                    # If prompt mentions specific subwords like 'login' or 'submit'
                    for cand in candidates:
                        cand_str = f"{cand.name} {str(cand.props)}".lower()
                        words = [w for w in prompt.split() if len(w) > 3 and w != kw]
                        if any(w in cand_str for w in words):
                            return cand
                    return candidates[0]

        return None

    @classmethod
    def _apply_patch_to_node(cls, node: UIComponentNode, patch: Dict[str, Any]) -> None:
        """Applies validated patch strictly to approved node fields."""
        if "name" in patch and isinstance(patch["name"], str):
            node.name = patch["name"]

        if "props" in patch and isinstance(patch["props"], dict):
            node.props.update(patch["props"])

        if "styles" in patch and isinstance(patch["styles"], dict):
            if "tailwind_classes" in patch["styles"]:
                node.styles.tailwind_classes = patch["styles"]["tailwind_classes"]
            if "custom_styles" in patch["styles"]:
                node.styles.custom_styles = patch["styles"]["custom_styles"]


correction_service = CorrectionService()
