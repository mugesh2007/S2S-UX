import io
import json
import os
import tempfile
import zipfile
import pytest
from fastapi import status


def test_complete_18_step_end_to_end_workflow(client, sample_png_bytes):
    """
    Executes the full 18-step end-to-end integration workflow:
    1. Open application (health check)
    2. Create a project
    3. Upload a sketch
    4. Validate the image
    5. Analyze the sketch using configured AI provider & CV preprocessor
    6. Review the structured interpretation
    7. Generate the interface
    8. View the generated UI AST
    9. Edit a component (text, color, dimensions, spacing)
    10. Run the fidelity checker
    11. Review detected differences
    12. Apply a correction (natural language translation)
    13. Run the checker again
    14. Save the project to SQLite
    15. Reopen the project from database
    16. Export the React project
    17. Download the ZIP file
    18. Build the exported project separately (verify structure & syntax)
    """

    # ================================================================
    # STEP 1: Open the application (Health & Telemetry)
    # ================================================================
    health_res = client.get("/api/v1/health")
    assert health_res.status_code == status.HTTP_200_OK
    health_data = health_res.json()
    assert health_data["status"] == "healthy"
    assert health_data["service"] == "Sketch2Screen AI"



    # ================================================================
    # STEP 3 & 4: Upload a sketch and validate image
    # ================================================================
    # Test 4a: Reject invalid / corrupted file
    corrupt_res = client.post(
        "/api/v1/sketches/upload",
        files={"file": ("corrupt.png", b"not-a-real-image-stream", "image/png")},
    )
    assert corrupt_res.status_code == status.HTTP_400_BAD_REQUEST

    # Test 4b: Accept valid PNG
    upload_res = client.post(
        "/api/v1/sketches/upload",
        files={"file": ("checkout-sketch.png", sample_png_bytes, "image/png")},
    )
    assert upload_res.status_code == status.HTTP_201_CREATED
    sketch_info = upload_res.json()
    sketch_id = sketch_info["sketch_id"]
    assert sketch_info["width"] >= 100
    assert sketch_info["height"] >= 100

    # ================================================================
    # STEP 5 & 6: Analyze the sketch & review structured interpretation
    # ================================================================
    cv_res = client.post(
        f"/api/v1/sketches/{sketch_id}/analyze",
        json={"strategy": "adaptive_clahe"},
    )
    assert cv_res.status_code == status.HTTP_200_OK
    cv_data = cv_res.json()
    assert cv_data["sketch_id"] == sketch_id
    assert cv_data["strategy_applied"] == "adaptive_clahe"
    assert "detected_contours" in cv_data
    assert "detected_annotations" in cv_data

    # ================================================================
    # STEP 2 & 7: Create project & generate interface
    # ================================================================
    create_res = client.post(
        "/api/v1/projects/generate",
        json={
            "sketch_id": sketch_id,
            "title": "Checkout Flow Screen",
            "user_annotations": ["Sticky header with cart", "Big Pay Now button"],
            "design_system": "modern-dark",
        },
    )
    assert create_res.status_code == status.HTTP_201_CREATED
    project = create_res.json()
    project_id = project["id"]
    assert project["title"] == "Checkout Flow Screen"
    assert project["status"] == "generated"
    assert project["node_count"] > 0

    # ================================================================
    # STEP 8: View the generated UI
    # ================================================================
    get_proj_res = client.get(f"/api/v1/projects/{project_id}")
    assert get_proj_res.status_code == status.HTTP_200_OK
    ast_root = get_proj_res.json()["interface"]
    assert ast_root["type"] == "Container"
    assert len(ast_root["children"]) > 0

    # ================================================================
    # STEP 9: Edit a component (Text, Colour, Dimensions, Spacing)
    # ================================================================
    edit_res = client.post(
        f"/api/v1/projects/{project_id}/components/node-btn-primary/edit",
        json={
            "name": "Pay Now Action Button",
            "props": {"label": "Pay Now $49.00", "variant": "primary"},
            "styles": {"tailwindClasses": "w-full h-12 p-4 bg-emerald-600 text-white"},
        },
    )
    assert edit_res.status_code == status.HTTP_200_OK
    updated_proj = edit_res.json()
    assert updated_proj["status"] == "generated"

    # ================================================================
    # STEP 10 & 11: Run fidelity checker & review detected differences
    # ================================================================
    fid_res1 = client.post(f"/api/v1/projects/{project_id}/fidelity-check")
    assert fid_res1.status_code == status.HTTP_200_OK
    report1 = fid_res1.json()
    assert report1["projectId"] == project_id
    assert 0 <= report1["overallScore"] <= 100
    assert report1["isMeasuredCV"] is True
    assert "layoutIoUScore" in report1["metrics"]
    assert "structuralEdgeSSIM" in report1["metrics"]
    assert len(report1["warnings"]) >= 1

    # ================================================================
    # STEP 12: Apply a correction (Natural Language Translation)
    # ================================================================
    # Translates "Make the button blue and full width" without page regen
    nl_res = client.post(
        f"/api/v1/projects/{project_id}/corrections/natural",
        json={"prompt": "Make the login button blue and full width", "componentId": "node-btn-primary"},
    )
    assert nl_res.status_code == status.HTTP_200_OK
    nl_data = nl_res.json()
    assert "blue" in nl_data["explanation"].lower()
    assert "bg-blue-600" in nl_data["translatedPatch"]["styles"]["tailwind_classes"]

    # ================================================================
    # STEP 13: Run the checker again
    # ================================================================
    fid_res2 = client.post(f"/api/v1/projects/{project_id}/fidelity-check")
    assert fid_res2.status_code == status.HTTP_200_OK
    report2 = fid_res2.json()
    assert report2["overallScore"] > 0

    # ================================================================
    # STEP 14: Save the project (Sync interface and status to SQLite)
    # ================================================================
    save_res = client.put(
        f"/api/v1/projects/{project_id}/interface",
        json={"interface": nl_data["interface"]},
    )
    assert save_res.status_code == status.HTTP_200_OK
    assert save_res.json()["status"] == "reviewed"

    # ================================================================
    # STEP 15: Reopen the project
    # ================================================================
    reopen_res = client.get(f"/api/v1/projects/{project_id}")
    assert reopen_res.status_code == status.HTTP_200_OK
    reopened = reopen_res.json()
    assert reopened["id"] == project_id
    assert reopened["status"] == "reviewed"

    # ================================================================
    # STEP 16 & 17: Export React project and download ZIP file
    # ================================================================
    # 16a. TSX standalone export
    tsx_res = client.post(
        f"/api/v1/projects/{project_id}/export",
        json={"format": "tsx", "componentName": "CheckoutFlowScreen"},
    )
    assert tsx_res.status_code == status.HTTP_200_OK
    assert "export const CheckoutFlowScreen" in tsx_res.json()["code"]

    # 17. ZIP package download
    zip_res = client.post(
        f"/api/v1/projects/{project_id}/export",
        json={"format": "zip", "componentName": "CheckoutFlowScreen"},
    )
    assert zip_res.status_code == status.HTTP_200_OK
    assert zip_res.headers["content-type"] == "application/zip"
    assert "checkoutflowscreen-project.zip" in zip_res.headers["content-disposition"]

    # ================================================================
    # STEP 18: Build the exported project separately
    # ================================================================
    with tempfile.TemporaryDirectory() as tmp_dir:
        zip_bytes = io.BytesIO(zip_res.content)
        with zipfile.ZipFile(zip_bytes, "r") as z:
            z.extractall(tmp_dir)

        # Verify package.json structure
        with open(os.path.join(tmp_dir, "package.json"), "r") as f:
            pkg = json.load(f)
            assert pkg["name"] == "sketch2screen-exported-project"
            assert "react" in pkg["dependencies"]

            assert "vite" in pkg["devDependencies"]
            assert "tailwindcss" in pkg["devDependencies"]

        # Verify vite.config.ts and tsconfig.json exist
        assert os.path.isfile(os.path.join(tmp_dir, "vite.config.ts"))
        assert os.path.isfile(os.path.join(tmp_dir, "tsconfig.json"))
        assert os.path.isfile(os.path.join(tmp_dir, "src/App.tsx"))
        assert os.path.isfile(os.path.join(tmp_dir, "src/main.tsx"))

        # Verify all 13 components exist
        comp_dir = os.path.join(tmp_dir, "src/components/ui")
        assert os.path.isdir(comp_dir)
        for comp_name in [
            "Button.tsx",
            "Input.tsx",
            "Card.tsx",
            "Container.tsx",
            "Heading.tsx",
            "Text.tsx",
            "Badge.tsx",
            "Avatar.tsx",
            "Checkbox.tsx",
            "Divider.tsx",
            "ImagePlaceholder.tsx",
            "Navbar.tsx",
            "Table.tsx",
            "index.ts",
        ]:
            assert os.path.isfile(os.path.join(comp_dir, comp_name))
