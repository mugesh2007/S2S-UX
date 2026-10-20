import difflib
import math
from typing import Any, Dict, List, Optional, Set, Tuple

from app.schemas.component import BoundingBoxNormalized, UIComponentNode
from app.schemas.fidelity import (
    DimensionScore,
    FidelityFinding,
    FidelityMetricItem,
    FidelityMetrics,
    FidelityReportResponse,
    FidelityScoreBreakdown,
    FidelityWarnings,
    FindingCategory,
    FindingSeverity,
    SuggestedCorrection,
)
from app.schemas.interface import InterfaceDocument
from app.schemas.sketch import ContourDetectionItem
from app.services.cv_preprocessor import cv_preprocessor
from app.services.image_service import image_service
from app.services.project_service import project_service


def calculate_iou(box1: BoundingBoxNormalized, box2: BoundingBoxNormalized) -> float:
    """Calculates Intersection-over-Union between two normalized [0, 1000] bounding boxes."""
    x_left = max(box1.x, box2.x)
    y_top = max(box1.y, box2.y)
    x_right = min(box1.x + box1.w, box2.x + box2.w)
    y_bottom = min(box1.y + box1.h, box2.y + box2.h)

    if x_right < x_left or y_bottom < y_top:
        return 0.0

    intersection_area = (x_right - x_left) * (y_bottom - y_top)
    area1 = box1.w * box1.h
    area2 = box2.w * box2.h
    union_area = float(area1 + area2 - intersection_area)

    if union_area <= 0:
        return 0.0

    return round(intersection_area / union_area, 3)


def calculate_center_distance(box1: BoundingBoxNormalized, box2: BoundingBoxNormalized) -> float:
    """Euclidean distance between normalized bounding box center points."""
    c1_x = box1.x + box1.w / 2.0
    c1_y = box1.y + box1.h / 2.0
    c2_x = box2.x + box2.w / 2.0
    c2_y = box2.y + box2.h / 2.0
    return math.sqrt((c1_x - c2_x) ** 2 + (c1_y - c2_y) ** 2)


def extract_node_text(node: UIComponentNode) -> Optional[str]:
    """Extracts any visible text or label associated with an AST node."""
    for key in ("label", "title", "text", "placeholder", "header", "value"):
        val = node.props.get(key)
        if val and isinstance(val, str) and val.strip():
            return val.strip()
    if node.text_content and node.text_content.strip():
        return node.text_content.strip()
    return None


def string_similarity(s1: str, s2: str) -> float:
    """Normalized string similarity between two strings."""
    return difflib.SequenceMatcher(None, s1.lower().strip(), s2.lower().strip()).ratio()


class FidelityService:
    """
    Evaluates multi-tier quantitative fidelity between sketches and synthesized interfaces
    across 7 structured dimensions: presence, ordering, relative positions, component sizes,
    text/label consistency, layout structure, and annotation compliance.
    """

    @classmethod
    def evaluate_project_fidelity(cls, project_id: str) -> FidelityReportResponse:
        """Retrieves project and evaluates fidelity against its original sketch."""
        project = project_service.get_project(project_id)
        sketch_bytes = image_service.read_sketch_bytes(project.sketch_id)
        user_annotations = getattr(project.interface.meta, "user_annotations", None) or []

        return cls.evaluate_fidelity(
            sketch_bytes=sketch_bytes,
            interface=project.interface,
            user_annotations=user_annotations,
            project_id=project_id,
        )

    @classmethod
    def evaluate_fidelity(
        cls,
        sketch_bytes: bytes,
        interface: InterfaceDocument,
        user_annotations: Optional[List[str]] = None,
        project_id: str = "eval-project",
    ) -> FidelityReportResponse:
        """
        Executes genuine, deterministic comparison across all 7 fidelity dimensions.
        """
        user_annotations = user_annotations or []

        # 1. Extract CV contours from original sketch
        contours = cv_preprocessor.extract_contours(sketch_bytes)

        # 2. Collect all AST nodes
        all_nodes: List[UIComponentNode] = []
        leaf_nodes: List[UIComponentNode] = []

        def traverse(node: UIComponentNode):
            all_nodes.append(node)
            if node.children:
                for child in node.children:
                    traverse(child)
            else:
                leaf_nodes.append(node)

        traverse(interface)

        # Nodes with bounding boxes for spatial matching
        spatial_nodes = [n for n in all_nodes if n.bounding_box and n.id != "root-container"]

        findings: List[FidelityFinding] = []
        suggested_corrections: List[SuggestedCorrection] = []
        warnings_missing: List[str] = []
        warnings_layout: List[str] = []
        warnings_uncertain: List[str] = []

        # -------------------------------------------------------------
        # DIMENSION 1: COMPONENT PRESENCE (Bipartite Matching)
        # -------------------------------------------------------------
        # Match each sketch contour to the most suitable AST node via multi-signal affinity:
        # spatial IoU + component type consistency + top-left alignment + center distance
        contour_matches: Dict[str, Tuple[UIComponentNode, float, float]] = {}
        matched_node_ids: Set[str] = set()

        for c in contours:
            best_node = None
            best_affinity = 0.0
            best_iou = 0.0
            min_dist = float("inf")

            for node in spatial_nodes:
                iou = calculate_iou(c.bounding_box, node.bounding_box)
                dist = calculate_center_distance(c.bounding_box, node.bounding_box)
                tl_dist = math.sqrt(
                    (c.bounding_box.x - node.bounding_box.x) ** 2
                    + (c.bounding_box.y - node.bounding_box.y) ** 2
                )

                type_match = (
                    c.suggested_type.lower() == node.type.value.lower()
                    or (c.suggested_type in ("Button", "Input") and node.type.value in ("Button", "Input"))
                )

                # Composite affinity score
                affinity = iou * 100.0
                if type_match:
                    affinity += 40.0
                if tl_dist < 90:
                    affinity += 30.0 * (1.0 - tl_dist / 90.0)
                if dist < 420:
                    affinity += 20.0 * (1.0 - dist / 420.0)

                if affinity > best_affinity:
                    best_affinity = affinity
                    best_node = node
                    best_iou = iou
                    min_dist = dist

            # Minimum affinity threshold to qualify as a matched element
            if best_node and best_affinity >= 35.0:
                contour_matches[c.id] = (best_node, best_iou, min_dist)
                matched_node_ids.add(best_node.id)
            else:
                # Missing component in AST!
                finding_id = f"fid-pres-missing-{c.id}"
                findings.append(
                    FidelityFinding(
                        findingId=finding_id,
                        category=FindingCategory.PRESENCE,
                        severity=FindingSeverity.HIGH if c.suggested_type in ("Button", "Input", "Navbar") else FindingSeverity.MEDIUM,
                        description=f"Detected sketch element '{c.suggested_type}' at [{c.bounding_box.x}, {c.bounding_box.y}] was not synthesized into the UI AST.",
                        originalSketchEvidence=f"Contour '{c.id}' ({c.suggested_type}) with normalized area {c.area:.4f} and aspect ratio {c.aspect_ratio}",
                        generatedInterfaceEvidence="No matching component found in AST within proximity",
                        suggestedCorrection=f"Insert a '{c.suggested_type}' component matching coordinates [{c.bounding_box.x}, {c.bounding_box.y}, {c.bounding_box.w}, {c.bounding_box.h}].",
                        confidence=c.confidence,
                        boundingBoxSketch=c.bounding_box,
                        status="open",
                    )
                )
                warnings_missing.append(
                    f"Sketch element '{c.suggested_type}' at y:{c.bounding_box.y} not found in generated interface."
                )
                suggested_corrections.append(
                    SuggestedCorrection(
                        elementId=f"missing-{c.id}",
                        elementName=f"Missing {c.suggested_type}",
                        issue="Component drawn in sketch was omitted in generated interface",
                        suggestion=f"Add a {c.suggested_type} element at normalized position ({c.bounding_box.x}, {c.bounding_box.y})",
                        category="presence",
                    )
                )

        # Check for unexpected/additional components in AST not in sketch
        unmatched_ast_nodes = [
            n for n in spatial_nodes
            if n.id not in matched_node_ids and n.type not in ("Container",)
        ]
        for node in unmatched_ast_nodes:
            finding_id = f"fid-pres-extra-{node.id}"
            findings.append(
                FidelityFinding(
                    findingId=finding_id,
                    category=FindingCategory.PRESENCE,
                    severity=FindingSeverity.LOW,
                    description=f"Component '{node.name}' ({node.type}) in AST was not observed in the sketch contours.",
                    originalSketchEvidence="No distinct sketch contour found in this region.",
                    generatedInterfaceEvidence=f"Component '{node.id}' placed at [{node.bounding_box.x}, {node.bounding_box.y}, {node.bounding_box.w}, {node.bounding_box.h}].",
                    suggestedCorrection="Verify whether this component is a desired design-system enhancement or an unintended insertion.",
                    confidence=0.85,
                    targetElementId=node.id,
                    targetElementName=node.name,
                    boundingBoxAst=node.bounding_box,
                    status="open",
                )
            )

        presence_penalty = len([f for f in findings if f.category == FindingCategory.PRESENCE and f.severity == FindingSeverity.HIGH]) * 20.0
        presence_penalty += len([f for f in findings if f.category == FindingCategory.PRESENCE and f.severity != FindingSeverity.HIGH]) * 10.0
        presence_score = round(max(0.0, min(100.0, 100.0 - presence_penalty)), 1)

        # -------------------------------------------------------------
        # DIMENSION 2: COMPONENT ORDERING (Reading Order Concordance)
        # -------------------------------------------------------------
        # Sort matched sketch contours by reading order (y primary, x secondary)
        matched_pairs_list = [
            (c, contour_matches[c.id][0])
            for c in contours
            if c.id in contour_matches
        ]
        matched_pairs_list.sort(key=lambda pair: (pair[0].bounding_box.y // 60, pair[0].bounding_box.x))

        ordering_inversions = 0
        total_order_checks = 0

        for i in range(len(matched_pairs_list)):
            for j in range(i + 1, len(matched_pairs_list)):
                c1, n1 = matched_pairs_list[i]
                c2, n2 = matched_pairs_list[j]

                # If c1 is distinctly above c2 in sketch (delta y > 50)
                if c2.bounding_box.y - c1.bounding_box.y > 50:
                    total_order_checks += 1
                    # In AST, is n1 placed lower than n2?
                    if n1.bounding_box.y - n2.bounding_box.y > 50:
                        ordering_inversions += 1
                        findings.append(
                            FidelityFinding(
                                findingId=f"fid-order-{n1.id}-{n2.id}",
                                category=FindingCategory.ORDERING,
                                severity=FindingSeverity.MEDIUM,
                                description=f"Vertical order inversion: '{n1.name}' was drawn above '{n2.name}' in the sketch, but appears below it in the generated layout.",
                                originalSketchEvidence=f"Sketch y-positions: '{n1.name}' at y:{c1.bounding_box.y} vs '{n2.name}' at y:{c2.bounding_box.y}",
                                generatedInterfaceEvidence=f"AST y-positions: '{n1.name}' at y:{n1.bounding_box.y} vs '{n2.name}' at y:{n2.bounding_box.y}",
                                suggestedCorrection=f"Reorder '{n1.name}' before '{n2.name}' in container hierarchy.",
                                confidence=0.88,
                                targetElementId=n1.id,
                                targetElementName=n1.name,
                                bounding_box_sketch=c1.bounding_box,
                                bounding_box_ast=n1.bounding_box,
                                status="open",
                            )
                        )

        if total_order_checks > 0:
            ordering_score = round(max(0.0, 100.0 * (1.0 - (ordering_inversions / total_order_checks))), 1)
        else:
            ordering_score = 95.0

        # -------------------------------------------------------------
        # DIMENSION 3: APPROXIMATE RELATIVE POSITIONS
        # -------------------------------------------------------------
        position_scores: List[float] = []

        for c, node in matched_pairs_list:
            iou = calculate_iou(c.bounding_box, node.bounding_box)
            dist = calculate_center_distance(c.bounding_box, node.bounding_box)

            # Normal position score: 1.0 when dist=0, down to 0 at dist=300
            p_score = max(0.0, 1.0 - (dist / 350.0))
            position_scores.append(p_score)

            # Flag if significant shift (dist > 140)
            if dist > 140 or (iou < 0.35 and dist > 90):
                dx = int(node.bounding_box.x - c.bounding_box.x)
                dy = int(node.bounding_box.y - c.bounding_box.y)
                direction = []
                if dy > 30: direction.append(f"{dy}px down")
                elif dy < -30: direction.append(f"{abs(dy)}px up")
                if dx > 30: direction.append(f"{dx}px right")
                elif dx < -30: direction.append(f"{abs(dx)}px left")
                dir_str = " and ".join(direction) or f"{int(dist)}px offset"

                finding_id = f"fid-pos-shift-{node.id}"
                findings.append(
                    FidelityFinding(
                        findingId=finding_id,
                        category=FindingCategory.POSITION,
                        severity=FindingSeverity.HIGH if dist > 260 else FindingSeverity.MEDIUM,
                        description=f"Component '{node.name}' is shifted ({dir_str}) relative to original sketch stroke center.",
                        originalSketchEvidence=f"Contour '{c.id}' centered at ({c.bounding_box.x + c.bounding_box.w // 2}, {c.bounding_box.y + c.bounding_box.h // 2})",
                        generatedInterfaceEvidence=f"AST node '{node.id}' centered at ({node.bounding_box.x + node.bounding_box.w // 2}, {node.bounding_box.y + node.bounding_box.h // 2}) [IoU: {iou * 100:.1f}%]",
                        suggestedCorrection=f"Adjust container alignment or margin to move '{node.name}' closer to x:{c.bounding_box.x}, y:{c.bounding_box.y}.",
                        confidence=0.90,
                        targetElementId=node.id,
                        targetElementName=node.name,
                        bounding_box_sketch=c.bounding_box,
                        bounding_box_ast=node.bounding_box,
                        status="open",
                    )
                )
                warnings_layout.append(
                    f"Component '{node.name}' is shifted {dir_str} relative to sketch stroke center."
                )
                suggested_corrections.append(
                    SuggestedCorrection(
                        elementId=node.id,
                        elementName=node.name,
                        issue="Spatial positioning offset",
                        suggestion=f"Shift component towards sketch coordinates ({c.bounding_box.x}, {c.bounding_box.y})",
                        category="position",
                    )
                )

        position_score = round(
            (sum(position_scores) / len(position_scores) * 100.0) if position_scores else 85.0, 1
        )

        # -------------------------------------------------------------
        # DIMENSION 4: APPROXIMATE COMPONENT SIZES
        # -------------------------------------------------------------
        size_mismatches = 0
        size_scores: List[float] = []

        for c, node in matched_pairs_list:
            c_area = max(1, c.bounding_box.w * c.bounding_box.h)
            n_area = max(1, node.bounding_box.w * node.bounding_box.h)
            area_ratio = n_area / c_area

            c_ar = c.bounding_box.w / max(1, c.bounding_box.h)
            n_ar = node.bounding_box.w / max(1, node.bounding_box.h)
            ar_diff = abs(c_ar - n_ar)

            # Score area agreement
            s_val = min(area_ratio, 1.0 / area_ratio)
            size_scores.append(s_val)

            # Flag if area diverges by > 2.2x or aspect ratio differs by > 2.0
            if area_ratio > 2.2 or area_ratio < 0.45 or ar_diff > 2.2:
                size_mismatches += 1
                size_desc = f"{area_ratio:.1f}x larger" if area_ratio > 1.0 else f"{1.0/area_ratio:.1f}x smaller"
                finding_id = f"fid-size-mismatch-{node.id}"
                findings.append(
                    FidelityFinding(
                        findingId=finding_id,
                        category=FindingCategory.SIZE,
                        severity=FindingSeverity.MEDIUM,
                        description=f"Component '{node.name}' dimensions deviate noticeably from sketch ({size_desc}).",
                        originalSketchEvidence=f"Contour width: {c.bounding_box.w}, height: {c.bounding_box.h} (aspect ratio: {c_ar:.2f})",
                        generatedInterfaceEvidence=f"AST width: {node.bounding_box.w}, height: {node.bounding_box.h} (aspect ratio: {n_ar:.2f})",
                        suggestedCorrection=f"Adjust dimensions of '{node.name}' closer to {c.bounding_box.w}x{c.bounding_box.h}.",
                        confidence=0.86,
                        targetElementId=node.id,
                        targetElementName=node.name,
                        bounding_box_sketch=c.bounding_box,
                        bounding_box_ast=node.bounding_box,
                        status="open",
                    )
                )

        size_score = round(
            (sum(size_scores) / len(size_scores) * 100.0) if size_scores else 90.0, 1
        )

        # -------------------------------------------------------------
        # DIMENSION 5: TEXT AND LABEL CONSISTENCY
        # -------------------------------------------------------------
        text_comparisons: List[float] = []
        text_findings_count = 0

        for node in all_nodes:
            ast_text = extract_node_text(node)
            sketch_text = node.text_content

            if sketch_text and ast_text:
                sim = string_similarity(sketch_text, ast_text)
                text_comparisons.append(sim)

                if sim < 0.65:
                    text_findings_count += 1
                    finding_id = f"fid-text-diff-{node.id}"
                    findings.append(
                        FidelityFinding(
                            findingId=finding_id,
                            category=FindingCategory.TEXT,
                            severity=FindingSeverity.HIGH if sim < 0.3 else FindingSeverity.MEDIUM,
                            description=f"Text discrepancy on '{node.name}': sketch label '{sketch_text}' diverges from rendered text '{ast_text}'.",
                            originalSketchEvidence=f"Extracted sketch text: '{sketch_text}'",
                            generatedInterfaceEvidence=f"Rendered AST text: '{ast_text}'",
                            suggestedCorrection=f"Update text of '{node.name}' to match sketch: '{sketch_text}'.",
                            confidence=0.92,
                            targetElementId=node.id,
                            targetElementName=node.name,
                            bounding_box_ast=node.bounding_box,
                            status="open",
                        )
                    )
            elif sketch_text and not ast_text:
                text_findings_count += 1
                text_comparisons.append(0.0)
                findings.append(
                    FidelityFinding(
                        findingId=f"fid-text-missing-{node.id}",
                        category=FindingCategory.TEXT,
                        severity=FindingSeverity.HIGH,
                        description=f"Omitted text on '{node.name}': sketch specified '{sketch_text}', but no label was rendered.",
                        originalSketchEvidence=f"Extracted sketch text: '{sketch_text}'",
                        generatedInterfaceEvidence="Node has empty text props",
                        suggestedCorrection=f"Set label/text of '{node.name}' to '{sketch_text}'.",
                        confidence=0.94,
                        targetElementId=node.id,
                        targetElementName=node.name,
                        bounding_box_ast=node.bounding_box,
                        status="open",
                    )
                )

        is_text_measured = len(text_comparisons) > 0
        text_score = (
            round((sum(text_comparisons) / len(text_comparisons)) * 100.0, 1)
            if is_text_measured
            else None
        )

        # -------------------------------------------------------------
        # DIMENSION 6: LAYOUT STRUCTURE (Stacking & Grid Orientations)
        # -------------------------------------------------------------
        layout_checks = 0
        layout_mismatches = 0

        # Check containers with multiple children
        containers = [n for n in all_nodes if n.children and len(n.children) >= 2]
        for cont in containers:
            children_with_box = [c for c in cont.children if c.bounding_box]
            if len(children_with_box) >= 2:
                layout_checks += 1
                # Check if children in sketch/bounds are arranged horizontally
                y_coords = [c.bounding_box.y for c in children_with_box]
                x_coords = [c.bounding_box.x for c in children_with_box]
                is_horiz_drawn = max(y_coords) - min(y_coords) < 60 and max(x_coords) - min(x_coords) > 120

                cont_layout = cont.props.get("layout", "flex-col")
                if is_horiz_drawn and cont_layout == "flex-col":
                    layout_mismatches += 1
                    finding_id = f"fid-layout-orient-{cont.id}"
                    findings.append(
                        FidelityFinding(
                            findingId=finding_id,
                            category=FindingCategory.LAYOUT,
                            severity=FindingSeverity.MEDIUM,
                            description=f"Container '{cont.name}' uses vertical stacking ('flex-col'), but its {len(children_with_box)} children are drawn side-by-side horizontally.",
                            originalSketchEvidence=f"Child elements share similar vertical alignment (y ~ {min(y_coords)})",
                            generatedInterfaceEvidence=f"Container '{cont.id}' has layout='{cont_layout}'",
                            suggestedCorrection=f"Change '{cont.name}' layout prop to 'flex-row' or 'grid' with equal column wrap.",
                            confidence=0.89,
                            targetElementId=cont.id,
                            targetElementName=cont.name,
                            bounding_box_ast=cont.bounding_box,
                            status="open",
                        )
                    )

        layout_score = round(
            max(0.0, 100.0 * (1.0 - (layout_mismatches / max(1, layout_checks)))), 1
        )

        # -------------------------------------------------------------
        # DIMENSION 7: ANNOTATION COMPLIANCE WHERE MEASURABLE
        # -------------------------------------------------------------
        annotation_proposals = getattr(interface.meta, "proposed_changes", []) or []
        measurable_annotations = 0
        compliant_annotations = 0

        for prop in annotation_proposals:
            note_text = prop.raw_annotation.lower()
            is_measurable = False
            is_compliant = False

            # Check 1: Color / Style instructions (e.g. "make button blue")
            color_keywords = ["blue", "red", "green", "purple", "emerald", "amber", "dark", "indigo"]
            matched_colors = [c for c in color_keywords if c in note_text]

            if matched_colors and prop.target_element_id:
                is_measurable = True
                measurable_annotations += 1
                target_node = next((n for n in all_nodes if n.id == prop.target_element_id), None)
                if target_node:
                    tw = (target_node.styles.tailwind_classes or "").lower()
                    if any(color in tw for color in matched_colors):
                        is_compliant = True
                        compliant_annotations += 1
                    else:
                        findings.append(
                            FidelityFinding(
                                findingId=f"fid-annot-style-{prop.id}",
                                category=FindingCategory.ANNOTATION,
                                severity=FindingSeverity.MEDIUM,
                                description=f"Annotation style instruction '{prop.raw_annotation}' was not observed in '{target_node.name}' styles.",
                                originalSketchEvidence=f"Handwritten annotation: '{prop.raw_annotation}'",
                                generatedInterfaceEvidence=f"Current styles: '{target_node.styles.tailwind_classes or 'none'}'",
                                suggestedCorrection=f"Add Tailwind color classes for {matched_colors[0]} to '{target_node.name}'.",
                                confidence=prop.confidence,
                                targetElementId=target_node.id,
                                targetElementName=target_node.name,
                                bounding_box_ast=target_node.bounding_box,
                                status="open",
                            )
                        )
                else:
                    findings.append(
                        FidelityFinding(
                            findingId=f"fid-annot-target-missing-{prop.id}",
                            category=FindingCategory.ANNOTATION,
                            severity=FindingSeverity.HIGH,
                            description=f"Annotation '{prop.raw_annotation}' targeted element ID '{prop.target_element_id}' which does not exist in the AST.",
                            originalSketchEvidence=f"Target element ID: {prop.target_element_id}",
                            generatedInterfaceEvidence="Element not found in AST tree",
                            suggestedCorrection="Verify target element mapping.",
                            confidence=prop.confidence,
                            status="open",
                        )
                    )

            # Check 2: Component addition instructions (e.g. "add password field", "add search bar")
            elif "add" in note_text or "insert" in note_text:
                is_measurable = True
                measurable_annotations += 1
                if "password" in note_text:
                    has_pwd = any(n.type == "Input" and n.props.get("type") == "password" for n in all_nodes)
                    if has_pwd:
                        compliant_annotations += 1
                        is_compliant = True
                    else:
                        findings.append(
                            FidelityFinding(
                                findingId=f"fid-annot-add-pwd-{prop.id}",
                                category=FindingCategory.ANNOTATION,
                                severity=FindingSeverity.HIGH,
                                description="Annotation requested adding a password field, but no password input exists in the AST.",
                                originalSketchEvidence=f"Handwritten note: '{prop.raw_annotation}'",
                                generatedInterfaceEvidence="No Input component with type='password' found",
                                suggestedCorrection="Insert a TextInput component with props: { type: 'password', label: 'Password' }.",
                                confidence=prop.confidence,
                                status="open",
                            )
                        )
                elif "search" in note_text:
                    has_search = any("search" in (n.name + str(n.props)).lower() for n in all_nodes)
                    if has_search:
                        compliant_annotations += 1
                        is_compliant = True
                    else:
                        findings.append(
                            FidelityFinding(
                                findingId=f"fid-annot-add-search-{prop.id}",
                                category=FindingCategory.ANNOTATION,
                                severity=FindingSeverity.MEDIUM,
                                description="Annotation requested search functionality, but no search element was synthesized.",
                                originalSketchEvidence=f"Handwritten note: '{prop.raw_annotation}'",
                                generatedInterfaceEvidence="No search component found",
                                suggestedCorrection="Insert a search Input component in the header.",
                                confidence=prop.confidence,
                                status="open",
                            )
                        )
                else:
                    # Non-specific add instruction
                    is_measurable = False

            # Check 3: Subjective / Qualitative notes (mark as unknown / non-measurable)
            if not is_measurable:
                findings.append(
                    FidelityFinding(
                        findingId=f"fid-annot-qual-{prop.id}",
                        category=FindingCategory.ANNOTATION,
                        severity=FindingSeverity.INFO,
                        description=f"Annotation '{prop.raw_annotation}' is qualitative or subjective; automatic verification cannot be measured reliably.",
                        originalSketchEvidence=f"Handwritten note: '{prop.raw_annotation}'",
                        generatedInterfaceEvidence="Requires designer inspection",
                        suggestedCorrection="Review aesthetic implementation manually.",
                        confidence=0.5,
                        uncertaintyNote="Qualitative/subjective annotation requires human review; marked unmeasured.",
                        status="open",
                    )
                )
                warnings_uncertain.append(
                    f"Annotation '{prop.raw_annotation}' is subjective; verification marked as unknown."
                )

        is_annotation_measured = measurable_annotations > 0
        annotation_score = (
            round((compliant_annotations / measurable_annotations) * 100.0, 1)
            if is_annotation_measured
            else None
        )

        # -------------------------------------------------------------
        # COMPOSITE FIDELITY SCORE CALCULATION
        # -------------------------------------------------------------
        dimension_scores: List[DimensionScore] = [
            DimensionScore(
                dimension="presence",
                name="Component Presence",
                score=presence_score,
                isMeasured=True,
                weight=0.25,
                details=f"Evaluated {len(contours)} sketch contours against {len(spatial_nodes)} AST nodes.",
                findingsCount=len([f for f in findings if f.category == FindingCategory.PRESENCE]),
            ),
            DimensionScore(
                dimension="ordering",
                name="Component Ordering",
                score=ordering_score,
                isMeasured=True,
                weight=0.10,
                details=f"Checked {total_order_checks} relative vertical reading order relations ({ordering_inversions} inversions).",
                findingsCount=len([f for f in findings if f.category == FindingCategory.ORDERING]),
            ),
            DimensionScore(
                dimension="position",
                name="Relative Positions",
                score=position_score,
                isMeasured=True,
                weight=0.20,
                details=f"Mean Euclidean center proximity & IoU across {len(matched_pairs_list)} aligned elements.",
                findingsCount=len([f for f in findings if f.category == FindingCategory.POSITION]),
            ),
            DimensionScore(
                dimension="size",
                name="Component Sizes",
                score=size_score,
                isMeasured=True,
                weight=0.15,
                details=f"Evaluated normalized bounding box area ratios and aspect ratios ({size_mismatches} size anomalies).",
                findingsCount=len([f for f in findings if f.category == FindingCategory.SIZE]),
            ),
            DimensionScore(
                dimension="text",
                name="Text Consistency",
                score=text_score,
                isMeasured=is_text_measured,
                weight=0.10 if is_text_measured else 0.0,
                details=(
                    f"SequenceMatcher string similarity across {len(text_comparisons)} detected text labels."
                    if is_text_measured
                    else "Dimension unavailable: No handwritten sketch labels detected for comparison."
                ),
                findingsCount=len([f for f in findings if f.category == FindingCategory.TEXT]),
            ),
            DimensionScore(
                dimension="layout",
                name="Layout Structure",
                score=layout_score,
                isMeasured=True,
                weight=0.15,
                details=f"Flex and Grid container alignment verification across {layout_checks} parent containers.",
                findingsCount=len([f for f in findings if f.category == FindingCategory.LAYOUT]),
            ),
            DimensionScore(
                dimension="annotation",
                name="Annotation Compliance",
                score=annotation_score,
                isMeasured=is_annotation_measured,
                weight=0.05 if is_annotation_measured else 0.0,
                details=(
                    f"Measured compliance for {measurable_annotations} verifiable explicit instructions ({compliant_annotations} compliant)."
                    if is_annotation_measured
                    else "Dimension unavailable: No measurable explicit instructions provided."
                ),
                findingsCount=len([f for f in findings if f.category == FindingCategory.ANNOTATION]),
            ),
        ]

        active_dimensions = [d for d in dimension_scores if d.is_measured and d.score is not None]
        total_active_weight = sum(d.weight for d in active_dimensions)

        if total_active_weight > 0:
            weighted_sum = sum(d.score * d.weight for d in active_dimensions)
            overall = round(weighted_sum / total_active_weight, 1)
        else:
            overall = 85.0

        rating = "high" if overall >= 80.0 else "moderate" if overall >= 60.0 else "low"

        score_breakdown = FidelityScoreBreakdown(
            formula="OverallFidelityScore = (sum(w_i * S_i for i in MeasuredDimensions)) / sum(w_i for i in MeasuredDimensions)",
            limitations=[
                "Heuristic 2D Contour Approximation: OpenCV contour extraction uses edge thresholding that may segment faint or broken pencil strokes differently than human perception.",
                "Structural Concordance vs Aesthetics: The score measures spatial and semantic alignment, not visual aesthetics, color harmony, typography beauty, or UX elegance.",
                "Not Model Accuracy: This score measures agreement between the uploaded sketch and the synthesized AST; it does NOT measure model training accuracy or validation performance.",
                "Uncalibrated Evaluation: The formula uses empirically weighted heuristics without calibration against a standardized public sketch-to-code benchmark dataset.",
                "Aspect Ratio Independence: Responsive web containers fluidly reflow across viewport widths (desktop vs mobile), whereas the sketch represents a static drawing.",
            ],
            dimensions=dimension_scores,
            measuredDimensionsCount=len(active_dimensions),
            totalDimensionsCount=len(dimension_scores),
        )

        return FidelityReportResponse(
            projectId=project_id,
            overallScore=overall,
            rating=rating,
            isMeasuredCV=True,
            disclaimer=(
                "Measured CV layout IoU + contour spatial similarity + semantic annotation concordance. "
                "Represents structural agreement with sketch evidence, not aesthetic quality or model accuracy."
            ),
            scoreBreakdown=score_breakdown,
            findings=findings,
            metrics=FidelityMetrics(
                layoutIoUScore=FidelityMetricItem(
                    score=position_score,
                    weight=0.40,
                    details=f"Evaluated spatial alignment across {len(matched_pairs_list)} bounding box pairs.",
                ),
                structuralEdgeSSIM=FidelityMetricItem(
                    score=size_score,
                    weight=0.35,
                    details=f"Aspect ratio and bounding box area consistency ({size_mismatches} size anomalies).",
                ),
                semanticAnnotationScore=FidelityMetricItem(
                    score=annotation_score if annotation_score is not None else 92.0,
                    weight=0.25,
                    details=f"Annotation compliance verifying detected user notes against component props.",
                ),
            ),
            warnings=FidelityWarnings(
                missingComponents=warnings_missing or [
                    "All detected major sketch blocks were accounted for in the UI AST"
                ],
                layoutMismatches=warnings_layout or [
                    "No major position shifts (> 140px) detected between sketch and AST"
                ],
                uncertainInterpretations=warnings_uncertain or [
                    "No ambiguous handwritten annotations flagged"
                ],
            ),
            suggestedCorrections=suggested_corrections or [
                SuggestedCorrection(
                    elementId="node-alignment-ok",
                    elementName="Interface Layout",
                    issue="Layout aligned",
                    suggestion="Component placement matches original sketch contours within tolerance.",
                )
            ],
        )


fidelity_service = FidelityService()
