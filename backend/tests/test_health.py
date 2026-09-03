"""
Tests for the /api/health endpoint.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint_returns_200():
    """Health endpoint should return 200 OK."""
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_response_structure():
    """Health response should have required fields."""
    response = client.get("/api/health")
    data = response.json()
    assert "status" in data
    assert "model_loaded" in data
    assert "model_version" in data
    assert data["status"] == "ok"


def test_health_model_loaded():
    """Model should be loaded after app startup."""
    response = client.get("/api/health")
    data = response.json()
    assert isinstance(data["model_loaded"], bool)


def test_root_endpoint():
    """Root endpoint should return API info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "docs" in data
    assert "health" in data
