from fastapi import status


def test_health_check_endpoint(client):
    """Verifies GET /api/v1/health returns 200 with service metadata."""
    response = client.get("/api/v1/health")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["status"] == "healthy"
    assert "Sketch2Screen" in data["service"]
    assert "version" in data
    assert "uptime_seconds" in data
    assert data["uptime_seconds"] >= 0
    assert "max_upload_size_mb" in data
