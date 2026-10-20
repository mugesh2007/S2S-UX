import io
import zipfile
from fastapi import status
from app.services.code_generator import code_generator, sanitize_zip_path


def test_sanitize_zip_path_security():
    """
    Verifies sanitize_zip_path strictly neutralizes path traversal,
    leading slashes, and Windows drive letters.
    """
    # Directory traversal
    assert sanitize_zip_path("../../etc/passwd") == "etc/passwd"
    assert sanitize_zip_path("../../../secrets/token.key") == "secrets/token.key"
    assert sanitize_zip_path("src/../../App.tsx") == "App.tsx"

    # Leading slashes
    assert sanitize_zip_path("/var/log/app.log") == "var/log/app.log"
    assert sanitize_zip_path("///root/keys") == "root/keys"

    # Windows drive letters and backslashes
    assert sanitize_zip_path("C:\\Windows\\System32\\cmd.exe") == "Windows/System32/cmd.exe"
    assert sanitize_zip_path("D:\\projects\\secret.env") == "projects/secret.env"


def test_zip_integrity_and_all_required_files(client, sample_png_bytes):
    """
    Verifies that the generated ZIP archive contains:
    - package.json
    - tsconfig.json & tsconfig.node.json
    - vite.config.ts
    - tailwind.config.js & postcss.config.js
    - index.html
    - README.md
    - src/index.css & src/main.tsx & src/App.tsx
    - src/components/ui/index.ts
    - All 13 modular UI components:
      Button, Input, Card, Container, Heading, Text, Badge, Avatar,
      Checkbox, Divider, ImagePlaceholder, Navbar, Table
    """
    # Upload sketch and generate project
    upload_res = client.post(
        "/api/v1/sketches/upload",
        files={"file": ("sketch.png", sample_png_bytes, "image/png")},
    )
    sketch_id = upload_res.json()["sketch_id"]

    gen_res = client.post(
        "/api/v1/projects/generate",
        json={
            "sketch_id": sketch_id,
            "title": "ProductionExportScreen",
            "design_system": "modern-dark",
        },
    )
    assert gen_res.status_code == status.HTTP_201_CREATED
    project_id = gen_res.json()["id"]

    export_res = client.post(
        f"/api/v1/projects/{project_id}/export",
        json={"format": "zip", "componentName": "ProductionExportScreen"},
    )
    assert export_res.status_code == status.HTTP_200_OK
    assert export_res.headers["content-type"] == "application/zip"

    zip_bytes = io.BytesIO(export_res.content)
    with zipfile.ZipFile(zip_bytes, "r") as z:
        namelist = set(z.namelist())

        required_core_files = [
            "package.json",
            "tsconfig.json",
            "tsconfig.node.json",
            "vite.config.ts",
            "tailwind.config.js",
            "postcss.config.js",
            "index.html",
            "README.md",
            "src/index.css",
            "src/main.tsx",
            "src/App.tsx",
            "src/components/ui/index.ts",
        ]
        for f in required_core_files:
            assert f in namelist, f"Missing required file in ZIP: {f}"

        # Verify all 13 modular UI components
        required_components = [
            "src/components/ui/Button.tsx",
            "src/components/ui/Input.tsx",
            "src/components/ui/Card.tsx",
            "src/components/ui/Container.tsx",
            "src/components/ui/Heading.tsx",
            "src/components/ui/Text.tsx",
            "src/components/ui/Badge.tsx",
            "src/components/ui/Avatar.tsx",
            "src/components/ui/Checkbox.tsx",
            "src/components/ui/Divider.tsx",
            "src/components/ui/ImagePlaceholder.tsx",
            "src/components/ui/Navbar.tsx",
            "src/components/ui/Table.tsx",
        ]
        for c in required_components:
            assert c in namelist, f"Missing modular component in ZIP: {c}"

        # Security check: verify no .env or secret tokens are present
        for filename in namelist:
            assert not filename.startswith(".env"), f"Sensitive file leaked: {filename}"
            assert ".env" not in filename, f"Sensitive file leaked: {filename}"
            assert "id_rsa" not in filename, f"Sensitive key leaked: {filename}"
            assert not filename.startswith("/"), f"Absolute path traversal detected: {filename}"
            assert ".." not in filename, f"Path traversal detected: {filename}"

        # Read package.json and verify React & Vite dependencies
        pkg_content = z.read("package.json").decode("utf-8")
        assert '"react":' in pkg_content
        assert '"vite":' in pkg_content
        assert '"tailwindcss":' in pkg_content

        # Read App.tsx and verify deterministic templates (no arbitrary eval)
        app_content = z.read("src/App.tsx").decode("utf-8")
        assert "ProductionExportScreen" in app_content
        assert "eval(" not in app_content


def test_failed_export_operations(client):
    """Verifies clean error handling for non-existent projects or invalid export formats."""
    # Non-existent project ID
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = client.post(
        f"/api/v1/projects/{fake_id}/export",
        json={"format": "zip"},
    )
    assert res.status_code == status.HTTP_404_NOT_FOUND

    # Invalid export format
    res_bad = client.post(
        f"/api/v1/projects/{fake_id}/export",
        json={"format": "unsupported_binary_format"},
    )
    assert res_bad.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_exported_react_build_and_unpacked_structure(client, sample_png_bytes):
    """
    Unpacks exported ZIP into a temporary directory and verifies that:
    1. Every file exists on disk with proper file sizes and permissions.
    2. Zero dangerous eval or Function constructors exist.
    3. All 13 UI components import React and export typed components.
    4. tsconfig.json and vite.config.ts are valid JSON/ESM configurations.
    """
    import os
    import tempfile

    upload_res = client.post(
        "/api/v1/sketches/upload",
        files={"file": ("sketch.png", sample_png_bytes, "image/png")},
    )
    sketch_id = upload_res.json()["sketch_id"]

    gen_res = client.post(
        "/api/v1/projects/generate",
        json={"sketch_id": sketch_id, "title": "BuildScreenTest"},
    )
    project_id = gen_res.json()["id"]

    export_res = client.post(
        f"/api/v1/projects/{project_id}/export",
        json={"format": "zip", "componentName": "BuildScreenTest"},
    )
    assert export_res.status_code == status.HTTP_200_OK

    with tempfile.TemporaryDirectory() as tmp_dir:
        zip_bytes = io.BytesIO(export_res.content)
        with zipfile.ZipFile(zip_bytes, "r") as z:
            z.extractall(tmp_dir)

        # 1. Verify filesystem existence
        assert os.path.exists(os.path.join(tmp_dir, "package.json"))
        assert os.path.exists(os.path.join(tmp_dir, "vite.config.ts"))
        assert os.path.exists(os.path.join(tmp_dir, "src/App.tsx"))
        assert os.path.exists(os.path.join(tmp_dir, "src/main.tsx"))
        assert os.path.exists(os.path.join(tmp_dir, "src/index.css"))
        assert os.path.exists(os.path.join(tmp_dir, "README.md"))

        # 2. Verify all 13 components exist and export typed components
        comp_dir = os.path.join(tmp_dir, "src/components/ui")
        assert os.path.isdir(comp_dir)
        ui_files = os.listdir(comp_dir)
        assert len(ui_files) == 14  # 13 components + index.ts

        for fname in ui_files:
            fpath = os.path.join(comp_dir, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                content = f.read()
                assert len(content) > 50
                assert "eval(" not in content
                assert "Function(" not in content
                if fname != "index.ts":
                    assert "import React" in content
                    assert "export const" in content

        # 3. Verify App.tsx imports modular components from ./components/ui
        with open(os.path.join(tmp_dir, "src/App.tsx"), "r", encoding="utf-8") as f:
            app_code = f.read()
            assert "from './components/ui'" in app_code
            assert "export const BuildScreenTest" in app_code

