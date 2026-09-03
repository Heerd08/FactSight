"""
Pytest configuration and database test fixtures.
"""

import pytest
from app.database.db import init_db, engine, Base


@pytest.fixture(autouse=True)
def setup_test_db():
    """Ensure all SQL tables are initialized for every test."""
    init_db()
    yield
