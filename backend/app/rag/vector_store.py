"""
Vector Store Service (Database 2) — Manages embeddings and semantic search for fact-checks.

Supports persistent ChromaDB storage with automatic collection indexing and similarity querying.
"""

import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.rag.embeddings import get_embedding_service

import tempfile

logger = logging.getLogger(__name__)

def _get_safe_vector_dir() -> Path:
    # Try local data dir first
    local_dir = settings.BASE_DIR / "data" / "vector_db"
    try:
        local_dir.mkdir(parents=True, exist_ok=True)
        return local_dir
    except Exception:
        # Fallback to temp directory on OneDrive / virtualized Windows paths
        temp_dir = Path(tempfile.gettempdir()) / "factsight_vector_db"
        temp_dir.mkdir(parents=True, exist_ok=True)
        return temp_dir

VECTOR_DB_DIR = _get_safe_vector_dir()


class VectorStore:
    """Vector Database client managing the fact-checking knowledge collection."""

    _instance = None

    def __init__(self, persist_dir: Optional[Path] = None):
        self.persist_dir = persist_dir or VECTOR_DB_DIR
        try:
            self.persist_dir.mkdir(parents=True, exist_ok=True)
        except Exception:
            self.persist_dir = Path(tempfile.gettempdir()) / "factsight_vector_db"
            self.persist_dir.mkdir(parents=True, exist_ok=True)
        self.client = None
        self.collection = None
        self.collection_name = "fact_checks"
        self.embedding_service = get_embedding_service()
        self.is_initialized = False

    @classmethod
    def get_instance(cls, persist_dir: Optional[Path] = None) -> "VectorStore":
        if cls._instance is None:
            cls._instance = cls(persist_dir=persist_dir)
        return cls._instance

    def initialize(self):
        """Initialize ChromaDB client and collection."""
        if self.is_initialized:
            return

        try:
            import chromadb
            from chromadb.config import Settings as ChromaSettings

            logger.info(f"Initializing ChromaDB Vector Store at: {self.persist_dir}")
            self.client = chromadb.PersistentClient(
                path=str(self.persist_dir),
                settings=ChromaSettings(anonymized_telemetry=False)
            )
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            self.is_initialized = True
            logger.info(f"Vector Store initialized. Total documents in collection: {self.collection.count()}")
        except Exception as e:
            logger.warning(f"ChromaDB initialization fallback: {e}. Using in-memory fallback store.")
            self._init_fallback_store()

    def _init_fallback_store(self):
        """In-memory cosine vector store fallback."""
        self.client = None
        self.collection = None
        self.memory_store: List[Dict[str, Any]] = []
        self.is_initialized = True

    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: List[str],
        embeddings: Optional[List[List[float]]] = None,
    ):
        """Add or update documents in the vector database."""
        if not self.is_initialized:
            self.initialize()

        if embeddings is None:
            embeddings = self.embedding_service.embed_batch(documents)

        if self.collection is not None:
            self.collection.upsert(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids,
            )
            logger.info(f"Successfully upserted {len(ids)} documents into ChromaDB.")
        else:
            # Fallback memory store
            for doc, meta, doc_id, emb in zip(documents, metadatas, ids, embeddings):
                # Update if exists, else append
                existing = next((item for item in self.memory_store if item["id"] == doc_id), None)
                if existing:
                    existing["document"] = doc
                    existing["metadata"] = meta
                    existing["embedding"] = emb
                else:
                    self.memory_store.append({
                        "id": doc_id,
                        "document": doc,
                        "metadata": meta,
                        "embedding": emb,
                    })

    def search(
        self,
        query: str,
        top_k: int = 5,
        min_similarity: float = 0.5,
    ) -> List[Dict[str, Any]]:
        """Search the vector database for the most semantically relevant fact-checks.

        Args:
            query: User claim or text excerpt
            top_k: Number of nearest matches to return
            min_similarity: Minimum cosine similarity score (0.0 to 1.0)

        Returns:
            List of dicts: [ { "id", "document", "metadata", "similarity" } ]
        """
        if not self.is_initialized:
            self.initialize()

        query_embedding = self.embedding_service.embed_text(query)

        results = []

        if self.collection is not None and self.collection.count() > 0:
            query_results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, self.collection.count()),
                include=["documents", "metadatas", "distances"],
            )

            docs = query_results["documents"][0] if query_results["documents"] else []
            metas = query_results["metadatas"][0] if query_results["metadatas"] else []
            ids = query_results["ids"][0] if query_results["ids"] else []
            distances = query_results["distances"][0] if query_results["distances"] else []

            for doc, meta, doc_id, dist in zip(docs, metas, ids, distances):
                # Chroma cosine distance is in range [0, 2]; similarity = 1 - distance
                similarity = max(0.0, min(1.0, 1.0 - dist))
                if similarity >= min_similarity:
                    results.append({
                        "id": doc_id,
                        "document": doc,
                        "metadata": meta,
                        "similarity": round(similarity, 4),
                    })
        elif hasattr(self, "memory_store") and self.memory_store:
            import numpy as np
            q_vec = np.array(query_embedding, dtype=np.float32)
            for item in self.memory_store:
                doc_vec = np.array(item["embedding"], dtype=np.float32)
                sim = float(np.dot(q_vec, doc_vec) / (np.linalg.norm(q_vec) * np.linalg.norm(doc_vec) + 1e-8))
                if sim >= min_similarity:
                    results.append({
                        "id": item["id"],
                        "document": item["document"],
                        "metadata": item["metadata"],
                        "similarity": round(sim, 4),
                    })
            results.sort(key=lambda x: x["similarity"], reverse=True)
            results = results[:top_k]

        return results

    def count(self) -> int:
        """Return total number of indexed documents."""
        if not self.is_initialized:
            self.initialize()
        if self.collection is not None:
            return self.collection.count()
        if hasattr(self, "memory_store"):
            return len(self.memory_store)
        return 0


def get_vector_store() -> VectorStore:
    return VectorStore.get_instance()
