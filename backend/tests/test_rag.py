"""
Tests for Pure RAG (Retrieval-Augmented Generation) and Vector Database functionality.
"""

import pytest
from app.rag.embeddings import EmbeddingService
from app.rag.vector_store import VectorStore
from app.rag.retriever import RAGRetriever
from app.rag.ingestion import seed_vector_store
from app.services.credibility_service import CredibilityService


class TestRAGPipeline:
    """Tests for Vector DB and Pure RAG retrieval."""

    def test_embedding_service_dimension(self):
        """Embedding service should generate 384-dimensional vector."""
        service = EmbeddingService.get_instance()
        emb = service.embed_text("Test claim about COVID vaccines.")
        assert isinstance(emb, list)
        assert len(emb) == 384
        assert all(isinstance(x, float) for x in emb)

    def test_vector_store_seed_and_search(self, tmp_path):
        """Vector store should index documents and return nearest semantic matches."""
        store = VectorStore(persist_dir=tmp_path / "test_chroma")
        store.initialize()

        # Add test fact checks
        docs = [
            "Claim: COVID vaccines contain microchips.\nVerification: Vaccines do not contain microchips or tracking technology.",
            "Claim: Water boils at 100C.\nVerification: At sea level water boils at 100 degrees Celsius.",
        ]
        metas = [
            {"claim": "COVID vaccines contain microchips", "source": "Reuters", "verdict": "False", "url": "https://reuters.com", "snippet": "No microchips in vaccines."},
            {"claim": "Water boils at 100C", "source": "NIST", "verdict": "True", "url": "https://nist.gov", "snippet": "Water boiling point is 100C."},
        ]
        ids = ["test_1", "test_2"]

        store.add_documents(documents=docs, metadatas=metas, ids=ids)
        assert store.count() == 2

        # Search for similar claim
        results = store.search("Do coronavirus vaccines have tracking chips in them?", top_k=1, min_similarity=0.3)
        assert len(results) > 0
        assert results[0]["id"] == "test_1"
        assert results[0]["similarity"] > 0.3
        assert results[0]["metadata"]["verdict"] == "False"

    def test_rag_retriever_evidence_structure(self, tmp_path):
        """RAG retriever should format evidence with consensus verdict."""
        store = VectorStore.get_instance(persist_dir=tmp_path / "test_chroma_2")
        store.initialize()
        seed_vector_store()

        retriever = RAGRetriever(min_similarity=0.4)
        result = retriever.retrieve("COVID-19 vaccines have government microchips")

        assert result["status"] == "found"
        assert len(result["sources"]) > 0
        assert result["max_similarity"] > 0.4
        assert result["consensus_verdict"] == "False"
        assert "microchip" in result["sources"][0]["snippet"].lower()

    def test_pure_rag_classification_logic(self):
        """Pure RAG credibility service should derive classification directly from vector evidence."""
        cred_service = CredibilityService()

        # True consensus with high similarity -> Genuine
        cls, conf = cred_service.evaluate_rag_classification(
            evidence_status="found",
            rag_consensus="True",
            rag_similarity=0.88,
        )
        assert cls == "Genuine"
        assert conf >= 0.80

        # False consensus with high similarity -> Fake
        cls, conf = cred_service.evaluate_rag_classification(
            evidence_status="found",
            rag_consensus="False",
            rag_similarity=0.85,
        )
        assert cls == "Fake"
        assert conf >= 0.80

        # No match found -> Unverified
        cls, conf = cred_service.evaluate_rag_classification(
            evidence_status="no_results",
            rag_consensus=None,
            rag_similarity=0.10,
        )
        assert cls == "Unverified"
