import uuid
from datetime import datetime, timezone
from typing import List, Optional
from app.ai.base import IVLMProvider
from app.schemas.component import (
    BoundingBoxNormalized,
    ComponentStyles,
    ComponentType,
    UIComponentNode,
)
from app.schemas.interface import (
    InterfaceDocument,
    InterfaceMeta,
    ProposedAnnotationChange,
)


class MockVLMProvider(IVLMProvider):
    """
    Deterministic offline VLM provider for local development, CI testing,
    and foundational verification. Explicitly marks output with is_mock=True.
    """

    def generate_interface(
        self,
        image_bytes: bytes,
        user_annotations: Optional[List[str]] = None,
        design_system: str = "modern-dark",
        title: Optional[str] = None,
    ) -> InterfaceDocument:
        annotations = user_annotations or []

        # Analyze annotations into proposed changes with explanations and confidence
        proposed_changes: List[ProposedAnnotationChange] = []
        button_label = "Run Health Audit"
        has_uncertainty = False

        for idx, ann in enumerate(annotations):
            ann_lower = ann.lower()
            if "blue" in ann_lower or "button" in ann_lower:
                proposed_changes.append(
                    ProposedAnnotationChange(
                        id=f"prop-{idx}",
                        rawAnnotation=ann,
                        targetElementId="node-btn-primary",
                        actionType="style_change",
                        explanation="Detected note requesting button styling/label adjustment.",
                        confidence=0.92,
                        isApplied=False,
                        proposedProperties={"variant": "primary"},
                    )
                )
            elif "sticky" in ann_lower or "nav" in ann_lower:
                proposed_changes.append(
                    ProposedAnnotationChange(
                        id=f"prop-{idx}",
                        rawAnnotation=ann,
                        targetElementId="node-nav-1",
                        actionType="layout_shift",
                        explanation="Detected instruction to pin navigation bar to top of viewport.",
                        confidence=0.95,
                        isApplied=False,
                        proposedProperties={"sticky": True},
                    )
                )
            elif "?" in ann or "unclear" in ann_lower:
                has_uncertainty = True
                proposed_changes.append(
                    ProposedAnnotationChange(
                        id=f"prop-{idx}",
                        rawAnnotation=ann,
                        targetElementId="node-grid-metrics",
                        actionType="clarification_needed",
                        explanation="Annotation contains uncertain or ambiguous visual evidence.",
                        confidence=0.55,
                        isApplied=False,
                    )
                )

        root = InterfaceDocument(
            id="root-container",
            type=ComponentType.CONTAINER,
            name="Screen Root Container",
            props={
                "layout": "flex-col",
                "gap": "gap-6",
                "padding": "p-6",
            },
            styles=ComponentStyles(
                tailwindClasses="min-h-screen bg-slate-950 text-slate-100 flex flex-col"
            ),
            boundingBox=BoundingBoxNormalized(x=0, y=0, w=1000, h=1000),
            meta=InterfaceMeta(
                title=title or "CloudOps Analytics Dashboard",
                pageType="dashboard",
                designSystem=design_system,
                aiProvider="mock",
                modelUsed="deterministic-mock-v1",
                isMock=True,
                createdAt=datetime.now(timezone.utc),
                proposedChanges=proposed_changes,
                uncertainElements=["card-waf"] if has_uncertainty else [],
            ),
            children=[
                UIComponentNode(
                    id="node-nav-1",
                    type=ComponentType.NAVBAR,
                    name="Top Navigation Bar",
                    props={
                        "title": "CloudOps AI",
                        "links": ["Overview", "Clusters", "Metrics", "Security"],
                        "hasUserAvatar": True,
                    },
                    styles=ComponentStyles(),
                    boundingBox=BoundingBoxNormalized(x=20, y=20, w=960, h=70),
                    textContent="CloudOps AI Overview Clusters Metrics Security",
                    confidence=0.98,
                    annotations=["Sticky header with active cluster badge"],
                ),
                UIComponentNode(
                    id="node-header-group",
                    type=ComponentType.CONTAINER,
                    name="Header Action Row",
                    props={"layout": "flex-row", "gap": "gap-4", "padding": "p-2"},
                    styles=ComponentStyles(
                        tailwindClasses="flex justify-between items-center"
                    ),
                    boundingBox=BoundingBoxNormalized(x=20, y=100, w=960, h=60),
                    children=[
                        UIComponentNode(
                            id="node-heading-title",
                            type=ComponentType.HEADING,
                            name="Page Heading",
                            props={"text": "System Metrics & Health", "level": 2},
                            styles=ComponentStyles(),
                            boundingBox=BoundingBoxNormalized(x=20, y=100, w=400, h=40),
                            textContent="System Metrics & Health",
                            confidence=0.96,
                        ),
                        UIComponentNode(
                            id="node-btn-primary",
                            type=ComponentType.BUTTON,
                            name="Primary Audit Action",
                            props={"label": button_label, "variant": "primary", "size": "sm"},
                            styles=ComponentStyles(),
                            boundingBox=BoundingBoxNormalized(x=800, y=100, w=180, h=40),
                            textContent=button_label,
                            confidence=0.94,
                            annotations=["Primary action button on right side"],
                        ),
                    ],
                ),
                UIComponentNode(
                    id="node-divider-1",
                    type=ComponentType.DIVIDER,
                    name="Section Divider",
                    props={},
                    styles=ComponentStyles(tailwindClasses="border-b border-slate-800 my-2"),
                    boundingBox=BoundingBoxNormalized(x=20, y=165, w=960, h=5),
                ),
                UIComponentNode(
                    id="node-grid-metrics",
                    type=ComponentType.CONTAINER,
                    name="Metric Cards Grid",
                    props={"layout": "grid-3", "gap": "gap-4", "padding": "p-0"},
                    styles=ComponentStyles(),
                    boundingBox=BoundingBoxNormalized(x=20, y=180, w=960, h=160),
                    children=[
                        UIComponentNode(
                            id="card-latency",
                            type=ComponentType.CARD,
                            name="Latency Metric Card",
                            props={"title": "Global API Latency", "subtitle": "p99 trailing 24h"},
                            styles=ComponentStyles(),
                            boundingBox=BoundingBoxNormalized(x=20, y=180, w=300, h=140),
                            confidence=0.91,
                            children=[
                                UIComponentNode(
                                    id="val-latency",
                                    type=ComponentType.HEADING,
                                    name="Latency Value",
                                    props={"text": "24.8 ms", "level": 1},
                                    styles=ComponentStyles(tailwindClasses="text-blue-400 font-mono"),
                                    textContent="24.8 ms",
                                ),
                                UIComponentNode(
                                    id="badge-latency",
                                    type=ComponentType.BADGE,
                                    name="Latency SLA Badge",
                                    props={"text": "Optimal (99.98% SLA)", "variant": "success"},
                                    styles=ComponentStyles(),
                                    textContent="Optimal (99.98% SLA)",
                                ),
                            ],
                        ),
                        UIComponentNode(
                            id="card-cpu",
                            type=ComponentType.CARD,
                            name="Compute Metric Card",
                            props={"title": "Compute Pool Load", "subtitle": "12 active worker nodes"},
                            styles=ComponentStyles(),
                            boundingBox=BoundingBoxNormalized(x=340, y=180, w=300, h=140),
                            confidence=0.90,
                            children=[
                                UIComponentNode(
                                    id="val-cpu",
                                    type=ComponentType.HEADING,
                                    name="CPU Load Value",
                                    props={"text": "42.6%", "level": 1},
                                    styles=ComponentStyles(tailwindClasses="text-violet-400 font-mono"),
                                    textContent="42.6%",
                                ),
                                UIComponentNode(
                                    id="badge-cpu",
                                    type=ComponentType.BADGE,
                                    name="CPU Status Badge",
                                    props={"text": "Balanced across 3 zones", "variant": "info"},
                                    styles=ComponentStyles(),
                                    textContent="Balanced across 3 zones",
                                ),
                            ],
                        ),
                        UIComponentNode(
                            id="card-waf",
                            type=ComponentType.CARD,
                            name="Security Defenses Card",
                            props={"title": "WAF Firewall Blocks", "subtitle": "Malicious payload mitigations"},
                            styles=ComponentStyles(),
                            boundingBox=BoundingBoxNormalized(x=660, y=180, w=300, h=140),
                            isUncertain=has_uncertainty,
                            uncertaintyReason="Card sub-badge label stroke is partially faint" if has_uncertainty else None,
                            confidence=0.72 if has_uncertainty else 0.88,
                            children=[
                                UIComponentNode(
                                    id="val-waf",
                                    type=ComponentType.HEADING,
                                    name="WAF Count Value",
                                    props={"text": "1,429", "level": 1},
                                    styles=ComponentStyles(tailwindClasses="text-amber-400 font-mono"),
                                    textContent="1,429",
                                ),
                                UIComponentNode(
                                    id="badge-waf",
                                    type=ComponentType.BADGE,
                                    name="WAF Alert Badge",
                                    props={"text": "All Mitigated", "variant": "warning"},
                                    styles=ComponentStyles(),
                                    textContent="All Mitigated",
                                ),
                            ],
                        ),
                    ],
                ),
                UIComponentNode(
                    id="node-card-table",
                    type=ComponentType.CARD,
                    name="Services Table Card",
                    props={"title": "Active Workloads & Services", "subtitle": "Real-time telemetry reports"},
                    styles=ComponentStyles(),
                    boundingBox=BoundingBoxNormalized(x=20, y=360, w=960, h=220),
                    children=[
                        UIComponentNode(
                            id="node-table",
                            type=ComponentType.TABLE,
                            name="Workloads Telemetry Table",
                            props={
                                "headers": ["Service Name", "Region", "Status", "Uptime"],
                                "rows": [
                                    ["auth-service-v2", "us-east-1", "Active", "99.99%"],
                                    ["ingress-proxy", "eu-west-1", "Active", "100.0%"],
                                    ["cache-redis-sharded", "ap-southeast-1", "Syncing", "99.91%"],
                                ],
                            },
                            styles=ComponentStyles(),
                            boundingBox=BoundingBoxNormalized(x=30, y=410, w=940, h=150),
                            confidence=0.95,
                        )
                    ],
                ),
            ],
        )
        return root

    def health_check(self) -> dict:
        return {
            "status": "healthy",
            "provider": "mock",
            "mode": "deterministic_offline",
            "active": True,
        }
