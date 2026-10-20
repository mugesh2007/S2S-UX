import io
import zipfile
from fastapi import status


def create_test_project(client, sample_png_bytes):
    """Helper to upload a sketch and generate a test project."""
    upload_res = client.post(
        "/api/v1/sketches/upload",
        files={"file": ("sketch.png", sample_png_bytes, "image/png")},
    )
    sketch_id = upload_res.json()["sketch_id"]

    gen_res = client.post(
        "/api/v1/projects/generate",
        json={
            "sketch_id": sketch_id,
            "title": "CloudOps Test Screen",
            "user_annotations": ["Sticky top navbar", "Audit button blue"],
            "design_system": "modern-dark",
        },
    )
    assert gen_res.status_code == status.HTTP_201_CREATED
    return gen_res.json()


def test_generate_and_get_project(client, sample_png_bytes):
    """Verifies generating project and retrieving it by ID."""
    proj = create_test_project(client, sample_png_bytes)
    project_id = proj["id"]

    assert proj["title"] == "CloudOps Test Screen"
    assert proj["node_count"] > 0
    assert "interface" in proj

    # Retrieve by ID
    get_res = client.get(f"/api/v1/projects/{project_id}")
    assert get_res.status_code == status.HTTP_200_OK
    assert get_res.json()["id"] == project_id


def test_list_projects(client, sample_png_bytes):
    """Verifies listing projects."""
    create_test_project(client, sample_png_bytes)
    res = client.get("/api/v1/projects")
    assert res.status_code == status.HTTP_200_OK

    projects = res.json()
    assert isinstance(projects, list)
    assert len(projects) >= 1
    assert "node_count" in projects[0]


def test_edit_component(client, sample_png_bytes):
    """Verifies modifying a specific component within the project AST."""
    proj = create_test_project(client, sample_png_bytes)
    project_id = proj["id"]

    edit_res = client.post(
        f"/api/v1/projects/{project_id}/components/node-btn-primary/edit",
        json={
            "name": "Updated Audit Button",
            "props": {"label": "Execute Security Audit", "variant": "danger"},
            "styles": {"tailwindClasses": "shadow-glow-md"},
        },
    )
    assert edit_res.status_code == status.HTTP_200_OK
    updated_proj = edit_res.json()

    # Find the updated button in children
    found = False
    for child in updated_proj["interface"]["children"]:
        if child["id"] == "node-header-group":
            for sub in child["children"]:
                if sub["id"] == "node-btn-primary":
                    assert sub["props"]["label"] == "Execute Security Audit"
                    assert sub["props"]["variant"] == "danger"
                    assert sub["styles"]["tailwindClasses"] == "shadow-glow-md"
                    found = True
                    break
    assert found is True


def test_fidelity_check(client, sample_png_bytes):
    """Verifies multi-tier fidelity checking on generated project."""
    proj = create_test_project(client, sample_png_bytes)
    project_id = proj["id"]

    fid_res = client.post(f"/api/v1/projects/{project_id}/fidelity-check")
    assert fid_res.status_code == status.HTTP_200_OK

    report = fid_res.json()
    assert report["projectId"] == project_id
    assert 0 <= report["overallScore"] <= 100
    assert report["isMeasuredCV"] is True
    assert "metrics" in report
    assert "layoutIoUScore" in report["metrics"]
    assert "structuralEdgeSSIM" in report["metrics"]
    assert "semanticAnnotationScore" in report["metrics"]
    assert "warnings" in report
    assert "suggestedCorrections" in report


def test_export_project_tsx(client, sample_png_bytes):
    """Verifies exporting project as standalone TSX string."""
    proj = create_test_project(client, sample_png_bytes)
    project_id = proj["id"]

    res = client.post(
        f"/api/v1/projects/{project_id}/export",
        json={"format": "tsx", "componentName": "CustomDashboard"},
    )
    assert res.status_code == status.HTTP_200_OK

    data = res.json()
    assert data["format"] == "tsx"
    assert "export const CustomDashboard" in data["code"]
    assert "import React from 'react';" in data["code"]


def test_export_project_zip(client, sample_png_bytes):
    """Verifies exporting project as complete Vite+React ZIP package."""
    proj = create_test_project(client, sample_png_bytes)
    project_id = proj["id"]

    res = client.post(
        f"/api/v1/projects/{project_id}/export",
        json={"format": "zip", "componentName": "CustomDashboard"},
    )
    assert res.status_code == status.HTTP_200_OK
    assert res.headers["content-type"] == "application/zip"

    # Verify zip content structure
    zip_bytes = io.BytesIO(res.content)
    with zipfile.ZipFile(zip_bytes, "r") as z:
        file_list = z.namelist()
        assert "package.json" in file_list
        assert "vite.config.ts" in file_list
        assert "tailwind.config.js" in file_list
        assert "src/App.tsx" in file_list
        assert "src/main.tsx" in file_list


def test_project_rename_and_delete(client, sample_png_bytes):
    """Verifies renaming and deleting a project from workspace and SQLite."""
    proj = create_test_project(client, sample_png_bytes)
    project_id = proj["id"]

    # Rename
    rename_res = client.patch(
        f"/api/v1/projects/{project_id}/rename",
        json={"title": "Renamed Modern Dashboard"},
    )
    assert rename_res.status_code == status.HTTP_200_OK
    assert rename_res.json()["title"] == "Renamed Modern Dashboard"

    # Verify get returns renamed title
    get_res = client.get(f"/api/v1/projects/{project_id}")
    assert get_res.json()["title"] == "Renamed Modern Dashboard"

    # Delete project
    del_res = client.delete(f"/api/v1/projects/{project_id}")
    assert del_res.status_code == status.HTTP_200_OK
    assert del_res.json()["success"] is True

    # Verify project is no longer found
    get_after_del = client.get(f"/api/v1/projects/{project_id}")
    assert get_after_del.status_code == status.HTTP_404_NOT_FOUND


def test_targeted_component_addition_deletion_duplication(client, sample_png_bytes):
    """Verifies targeted component addition, deletion, and duplication without full page regen."""
    proj = create_test_project(client, sample_png_bytes)
    project_id = proj["id"]

    # 1. Duplicate component
    dup_res = client.post(
        f"/api/v1/projects/{project_id}/components/node-btn-primary/duplicate"
    )
    assert dup_res.status_code == status.HTTP_200_OK
    dup_proj = dup_res.json()
    assert dup_proj["node_count"] == proj["node_count"] + 1

    # 2. Add component to container
    add_res = client.post(
        f"/api/v1/projects/{project_id}/components/node-header-group/children",
        json={
            "component": {
                "id": "node-badge-new",
                "type": "Badge",
                "name": "Live Status Badge",
                "props": {"text": "System Operational", "variant": "success"},
            }
        },
    )
    assert add_res.status_code == status.HTTP_200_OK
    added_proj = add_res.json()
    assert added_proj["node_count"] == dup_proj["node_count"] + 1

    # 3. Delete component
    del_comp_res = client.delete(
        f"/api/v1/projects/{project_id}/components/node-badge-new"
    )
    assert del_comp_res.status_code == status.HTTP_200_OK
    assert del_comp_res.json()["node_count"] == dup_proj["node_count"]


def test_natural_language_component_correction(client, sample_png_bytes):
    """Verifies translating natural-language prompt into validated property updates."""
    proj = create_test_project(client, sample_png_bytes)
    project_id = proj["id"]

    # "Make the login button blue"
    corr_res = client.post(
        f"/api/v1/projects/{project_id}/corrections/natural",
        json={"prompt": "Make the audit button blue", "componentId": "node-btn-primary"},
    )
    assert corr_res.status_code == status.HTTP_200_OK
    corr_data = corr_res.json()
    assert corr_data["componentId"] == "node-btn-primary"
    assert "blue" in corr_data["explanation"].lower()
    assert corr_data["translatedPatch"]["props"]["variant"] == "primary"
    assert "bg-blue-600" in corr_data["translatedPatch"]["styles"]["tailwind_classes"]

    # Dimension natural correction: "Make wide and tall"
    dim_res = client.post(
        f"/api/v1/projects/{project_id}/corrections/natural",
        json={"prompt": "Make it full width and tall", "componentId": "node-btn-primary"},
    )
    assert dim_res.status_code == status.HTTP_200_OK
    dim_data = dim_res.json()
    assert "w-full" in dim_data["translatedPatch"]["styles"]["tailwind_classes"]
    assert "h-64" in dim_data["translatedPatch"]["styles"]["tailwind_classes"]


def test_invalid_interface_document_rejection(client, sample_png_bytes):
    """Verifies schema validation strictly rejects invalid or malformed AST structures."""
    proj = create_test_project(client, sample_png_bytes)
    project_id = proj["id"]

    # Reject malformed interface document (invalid confidence and invalid type)
    bad_res = client.put(
        f"/api/v1/projects/{project_id}/interface",
        json={
            "interface": {
                "id": "root",
                "type": "MaliciousScriptTag",  # Disallowed type
                "name": "HackedNode",
                "confidence": 99.0,  # Invalid: confidence must be <= 1.0
            }
        },
    )
    assert bad_res.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

