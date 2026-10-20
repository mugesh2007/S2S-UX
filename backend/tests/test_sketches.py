from fastapi import status


def test_upload_valid_png(client, sample_png_bytes):
    """Verifies uploading valid PNG succeeds with 201 and correct metadata."""
    files = {"file": ("sketch.png", sample_png_bytes, "image/png")}
    response = client.post("/api/v1/sketches/upload", files=files)
    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()
    assert "sketch_id" in data
    assert data["mime_type"] == "image/png"
    assert data["width"] == 200
    assert data["height"] == 200
    assert data["filename"].endswith(".png")


def test_upload_valid_jpeg(client, sample_jpeg_bytes):
    """Verifies uploading valid JPEG succeeds."""
    files = {"file": ("sketch.jpg", sample_jpeg_bytes, "image/jpeg")}
    response = client.post("/api/v1/sketches/upload", files=files)
    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()
    assert data["mime_type"] == "image/jpeg"
    assert data["width"] == 300
    assert data["height"] == 200


def test_upload_valid_webp(client, sample_webp_bytes):
    """Verifies uploading valid WebP succeeds."""
    files = {"file": ("sketch.webp", sample_webp_bytes, "image/webp")}
    response = client.post("/api/v1/sketches/upload", files=files)
    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()
    assert data["mime_type"] == "image/webp"
    assert data["width"] == 250
    assert data["height"] == 250


def test_reject_corrupted_image(client, corrupted_image_bytes):
    """Verifies rejection of invalid/corrupted bytes masquerading as image."""
    files = {"file": ("fake.png", corrupted_image_bytes, "image/png")}
    response = client.post("/api/v1/sketches/upload", files=files)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "IMAGE_VALIDATION_ERROR"


def test_reject_tiny_dimensions(client, tiny_image_bytes):
    """Verifies rejection of image below 64x64 minimum dimensions."""
    files = {"file": ("tiny.png", tiny_image_bytes, "image/png")}
    response = client.post("/api/v1/sketches/upload", files=files)
    assert response.status_code == status.HTTP_400_BAD_REQUEST

    data = response.json()
    assert "too small" in data["error"]["message"]


def test_analyze_sketch_strategies(client, sample_png_bytes):
    """Verifies analyzing sketch with different preprocessing strategies."""
    # First upload
    upload_res = client.post(
        "/api/v1/sketches/upload",
        files={"file": ("sketch.png", sample_png_bytes, "image/png")},
    )
    sketch_id = upload_res.json()["sketch_id"]

    strategies = ["adaptive_clahe", "standard_enhance", "otsu_binary", "none"]

    for strat in strategies:
        analyze_res = client.post(
            f"/api/v1/sketches/{sketch_id}/analyze",
            json={"strategy": strat, "user_annotations": ["Sticky navbar"]},
        )
        assert analyze_res.status_code == status.HTTP_200_OK

        data = analyze_res.json()
        assert data["sketch_id"] == sketch_id
        assert data["strategy_applied"] == strat
        assert "detected_contours" in data
        assert isinstance(data["detected_contours"], list)
        assert data["processing_time_ms"] >= 0

        # Verify bounding box coordinate normalization
        for c in data["detected_contours"]:
            box = c["bounding_box"]
            assert 0 <= box["x"] <= 1000
            assert 0 <= box["y"] <= 1000
            assert 1 <= box["w"] <= 1000
            assert 1 <= box["h"] <= 1000


def test_analyze_nonexistent_sketch(client):
    """Verifies 404 when analyzing non-existent sketch ID."""
    response = client.post(
        "/api/v1/sketches/non-existent-id/analyze",
        json={"strategy": "adaptive_clahe"},
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
