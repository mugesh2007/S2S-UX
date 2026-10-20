import pytest
from app.schemas.component import BoundingBoxNormalized, ComponentType, UIComponentNode
from app.schemas.fidelity import FindingCategory, FindingSeverity
from app.schemas.interface import InterfaceDocument, InterfaceMeta, ProposedAnnotationChange
from app.schemas.sketch import ContourDetectionItem
from app.services.cv_preprocessor import cv_preprocessor
from app.services.fidelity_service import fidelity_service


@pytest.fixture
def base_test_interface() -> InterfaceDocument:
    """Creates a basic valid InterfaceDocument AST for testing."""
    return InterfaceDocument(
        id="root-container",
        type=ComponentType.CONTAINER,
        name="Root Container",
        props={"layout": "flex-col"},
        boundingBox=BoundingBoxNormalized(x=0, y=0, w=1000, h=1000),
        meta=InterfaceMeta(
            title="Synthetic Evaluation Screen",
            pageType="dashboard",
            designSystem="modern-dark",
        ),
        children=[
            UIComponentNode(
                id="nav-main",
                type=ComponentType.NAVBAR,
                name="Main Navigation",
                props={"title": "Cloud Dashboard"},
                boundingBox=BoundingBoxNormalized(x=20, y=20, w=960, h=80),
                children=[],
            )
        ],
    )


def test_synthetic_missing_button(sample_png_bytes, base_test_interface, monkeypatch):
    """
    Synthetic Case 1: Missing Button
    Sketch has a Button contour, but the generated AST omits it.
    Verifies that the checker flags a high-severity PRESENCE finding.
    """
    mock_contours = [
        ContourDetectionItem(
            id="contour-nav-0",
            contour_index=0,
            bounding_box=BoundingBoxNormalized(x=20, y=20, w=960, h=80),
            area=0.08,
            aspect_ratio=12.0,
            confidence=0.95,
            suggested_type="Navbar",
        ),
        ContourDetectionItem(
            id="contour-btn-action",
            contour_index=1,
            bounding_box=BoundingBoxNormalized(x=50, y=200, w=220, h=60),
            area=0.013,
            aspect_ratio=3.6,
            confidence=0.92,
            suggested_type="Button",
        ),
    ]
    monkeypatch.setattr(cv_preprocessor, "extract_contours", lambda bytes_data, **kwargs: mock_contours)

    report = fidelity_service.evaluate_fidelity(
        sketch_bytes=sample_png_bytes,
        interface=base_test_interface,
        project_id="test-missing-button",
    )

    presence_findings = [f for f in report.findings if f.category == FindingCategory.PRESENCE]
    missing_buttons = [f for f in presence_findings if "Button" in f.description]

    assert len(missing_buttons) >= 1
    assert missing_buttons[0].severity == FindingSeverity.HIGH
    assert missing_buttons[0].suggested_correction is not None
    assert missing_buttons[0].bounding_box_sketch is not None
    assert missing_buttons[0].bounding_box_sketch.x == 50


def test_synthetic_moved_input_field(sample_png_bytes, base_test_interface, monkeypatch):
    """
    Synthetic Case 2: Moved Input Field
    Input field in AST is shifted vertically down by ~350 units relative to the sketch contour.
    Verifies that the checker flags a POSITION finding with direction and offset.
    """
    mock_contours = [
        ContourDetectionItem(
            id="contour-input-search",
            contour_index=0,
            bounding_box=BoundingBoxNormalized(x=100, y=100, w=350, h=50),
            area=0.0175,
            aspect_ratio=7.0,
            confidence=0.90,
            suggested_type="Input",
        )
    ]
    monkeypatch.setattr(cv_preprocessor, "extract_contours", lambda bytes_data, **kwargs: mock_contours)

    # Place Input in AST at y=460 (shifted 360 units down)
    base_test_interface.children = [
        UIComponentNode(
            id="input-search",
            type=ComponentType.INPUT,
            name="Search Input",
            props={"placeholder": "Search..."},
            boundingBox=BoundingBoxNormalized(x=100, y=460, w=350, h=50),
            children=[],
        )
    ]

    report = fidelity_service.evaluate_fidelity(
        sketch_bytes=sample_png_bytes,
        interface=base_test_interface,
        project_id="test-moved-input",
    )

    pos_findings = [f for f in report.findings if f.category == FindingCategory.POSITION]
    assert len(pos_findings) >= 1
    assert pos_findings[0].target_element_id == "input-search"
    assert "down" in pos_findings[0].description.lower() or "offset" in pos_findings[0].description.lower()


def test_synthetic_changed_heading_text(sample_png_bytes, base_test_interface, monkeypatch):
    """
    Synthetic Case 3: Changed Heading Text
    Sketch text was 'Welcome Back Admin', but generated text is 'Goodbye System'.
    Verifies that the checker flags a TEXT consistency finding.
    """
    mock_contours = [
        ContourDetectionItem(
            id="contour-head-0",
            contour_index=0,
            bounding_box=BoundingBoxNormalized(x=40, y=120, w=400, h=60),
            area=0.024,
            aspect_ratio=6.6,
            confidence=0.90,
            suggested_type="Heading",
        )
    ]
    monkeypatch.setattr(cv_preprocessor, "extract_contours", lambda bytes_data, **kwargs: mock_contours)

    base_test_interface.children = [
        UIComponentNode(
            id="heading-hero",
            type=ComponentType.HEADING,
            name="Hero Title",
            props={"text": "Goodbye System"},  # Rendered text
            text_content="Welcome Back Admin",  # Visible sketch text
            boundingBox=BoundingBoxNormalized(x=40, y=120, w=400, h=60),
            children=[],
        )
    ]

    report = fidelity_service.evaluate_fidelity(
        sketch_bytes=sample_png_bytes,
        interface=base_test_interface,
        project_id="test-changed-heading",
    )

    text_findings = [f for f in report.findings if f.category == FindingCategory.TEXT]
    assert len(text_findings) >= 1
    assert "Welcome Back Admin" in text_findings[0].description
    assert "Goodbye System" in text_findings[0].description

    # Check text dimension score in breakdown
    text_dim = next(d for d in report.score_breakdown.dimensions if d.dimension == "text")
    assert text_dim.is_measured is True
    assert text_dim.score is not None
    assert text_dim.score < 50.0  # Significant divergence


def test_synthetic_incorrect_component_size(sample_png_bytes, base_test_interface, monkeypatch):
    """
    Synthetic Case 4: Incorrect Component Size
    Sketch contour has a large hero card (800x400), but AST renders a tiny box (150x80).
    Verifies that the checker flags a SIZE finding.
    """
    mock_contours = [
        ContourDetectionItem(
            id="contour-card-hero",
            contour_index=0,
            bounding_box=BoundingBoxNormalized(x=100, y=150, w=800, h=400),
            area=0.32,
            aspect_ratio=2.0,
            confidence=0.94,
            suggested_type="Card",
        )
    ]
    monkeypatch.setattr(cv_preprocessor, "extract_contours", lambda bytes_data, **kwargs: mock_contours)

    base_test_interface.children = [
        UIComponentNode(
            id="card-hero",
            type=ComponentType.CARD,
            name="Hero Card",
            boundingBox=BoundingBoxNormalized(x=100, y=150, w=150, h=80),  # Area ratio < 0.05
            children=[],
        )
    ]

    report = fidelity_service.evaluate_fidelity(
        sketch_bytes=sample_png_bytes,
        interface=base_test_interface,
        project_id="test-incorrect-size",
    )

    size_findings = [f for f in report.findings if f.category == FindingCategory.SIZE]
    assert len(size_findings) >= 1
    assert size_findings[0].target_element_id == "card-hero"
    assert "smaller" in size_findings[0].description.lower() or "deviate" in size_findings[0].description.lower()


def test_synthetic_additional_component(sample_png_bytes, base_test_interface, monkeypatch):
    """
    Synthetic Case 5: Additional Unexpected Component
    AST contains an extra Button in lower corner not observed in any sketch contour.
    Verifies that the checker flags an unexpected PRESENCE finding (severity LOW).
    """
    mock_contours = [
        ContourDetectionItem(
            id="contour-nav-0",
            contour_index=0,
            bounding_box=BoundingBoxNormalized(x=20, y=20, w=960, h=80),
            area=0.08,
            aspect_ratio=12.0,
            confidence=0.95,
            suggested_type="Navbar",
        )
    ]
    monkeypatch.setattr(cv_preprocessor, "extract_contours", lambda bytes_data, **kwargs: mock_contours)

    # Base interface has Navbar AND extra button at (800, 850)
    base_test_interface.children.append(
        UIComponentNode(
            id="btn-extra-undrawn",
            type=ComponentType.BUTTON,
            name="Unprompted Floating Button",
            props={"label": "Mystery Action"},
            boundingBox=BoundingBoxNormalized(x=800, y=850, w=160, h=50),
            children=[],
        )
    )

    report = fidelity_service.evaluate_fidelity(
        sketch_bytes=sample_png_bytes,
        interface=base_test_interface,
        project_id="test-extra-component",
    )

    extra_findings = [
        f for f in report.findings
        if f.category == FindingCategory.PRESENCE and f.target_element_id == "btn-extra-undrawn"
    ]
    assert len(extra_findings) >= 1
    assert extra_findings[0].severity == FindingSeverity.LOW
    assert "not observed in the sketch" in extra_findings[0].description


def test_synthetic_uncertain_handwritten_annotation(sample_png_bytes, base_test_interface, monkeypatch):
    """
    Synthetic Case 6: Uncertain Handwritten Annotation
    A qualitative annotation 'Make the interface feel modern and minimalist'
    cannot be reliably measured by algorithmic CV/AST comparison.
    Verifies that the checker marks it as unknown/unmeasured with uncertainty notes.
    """
    mock_contours = [
        ContourDetectionItem(
            id="contour-nav-0",
            contour_index=0,
            bounding_box=BoundingBoxNormalized(x=20, y=20, w=960, h=80),
            area=0.08,
            aspect_ratio=12.0,
            confidence=0.95,
            suggested_type="Navbar",
        )
    ]
    monkeypatch.setattr(cv_preprocessor, "extract_contours", lambda bytes_data, **kwargs: mock_contours)

    base_test_interface.meta.proposed_changes = [
        ProposedAnnotationChange(
            id="prop-qualitative-01",
            rawAnnotation="Make the interface feel modern and minimalist",
            actionType="style_change",
            explanation="Subjective aesthetic guidance from user margin note",
            confidence=0.5,
            isApplied=False,
        )
    ]

    report = fidelity_service.evaluate_fidelity(
        sketch_bytes=sample_png_bytes,
        interface=base_test_interface,
        project_id="test-uncertain-annotation",
    )

    annot_findings = [f for f in report.findings if f.category == FindingCategory.ANNOTATION]
    assert len(annot_findings) >= 1
    assert annot_findings[0].severity == FindingSeverity.INFO
    assert annot_findings[0].uncertainty_note is not None
    assert "subjective" in annot_findings[0].description.lower() or "cannot be measured" in annot_findings[0].description.lower()


def test_fidelity_score_formula_and_limitations(sample_png_bytes, base_test_interface, monkeypatch):
    """
    Verifies that the composite fidelity score:
    - Documents its formula.
    - Documents its limitations.
    - Distinguishes measured from unmeasured dimensions.
    - Is bounded between 0 and 100.
    """
    mock_contours = [
        ContourDetectionItem(
            id="contour-nav-0",
            contour_index=0,
            bounding_box=BoundingBoxNormalized(x=20, y=20, w=960, h=80),
            area=0.08,
            aspect_ratio=12.0,
            confidence=0.95,
            suggested_type="Navbar",
        )
    ]
    monkeypatch.setattr(cv_preprocessor, "extract_contours", lambda bytes_data, **kwargs: mock_contours)

    report = fidelity_service.evaluate_fidelity(
        sketch_bytes=sample_png_bytes,
        interface=base_test_interface,
        project_id="test-formula-limitations",
    )

    breakdown = report.score_breakdown
    assert "OverallFidelityScore" in breakdown.formula
    assert len(breakdown.limitations) >= 4
    assert any("Heuristic" in lim for lim in breakdown.limitations)
    assert any("Not Model Accuracy" in lim for lim in breakdown.limitations)
    assert any("Uncalibrated" in lim for lim in breakdown.limitations)

    # Check dimension representation
    assert len(breakdown.dimensions) == 7
    dim_names = {d.dimension for d in breakdown.dimensions}
    expected_dims = {"presence", "ordering", "position", "size", "text", "layout", "annotation"}
    assert dim_names == expected_dims

    # Overall score must be bounded
    assert 0.0 <= report.overall_score <= 100.0
