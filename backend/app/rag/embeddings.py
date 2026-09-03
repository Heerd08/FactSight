"""
Embeddings Service — Generates dense vector embeddings for claims and fact-check documents.

Uses `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense vectors).
Provides fast local embedding generation on CPU or GPU.
"""

import logging
from typing import List, Union
import numpy as np

logger = logging.getLogger(__name__)

# Default model name
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"


class EmbeddingService:
    """Singleton service for generating semantic text embeddings."""

    _instance = None

    def __init__(self, model_name: str = DEFAULT_EMBEDDING_MODEL):
        self.model_name = model_name
        self.model = None
        self.is_loaded = False

    @classmethod
    def get_instance(cls, model_name: str = DEFAULT_EMBEDDING_MODEL) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = cls(model_name=model_name)
        return cls._instance

    def load(self):
        """Load the SentenceTransformer model."""
        if self.is_loaded:
            return

        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            self.is_loaded = True
            logger.info("Embedding model loaded successfully.")
        except Exception as e:
            logger.warning(f"SentenceTransformer load warning: {e}. Falling back to TF-IDF/Hash embedding if needed.")
            self.is_loaded = False

    def embed_text(self, text: str) -> List[float]:
        """Generate a normalized 1D embedding vector for a single text."""
        if not self.is_loaded:
            self.load()

        if self.is_loaded and self.model is not None:
            embedding = self.model.encode(text, convert_to_numpy=True, normalize_embeddings=True)
            return embedding.tolist()
        else:
            # Fallback simple deterministic vector for offline / mock testing
            return self._fallback_embed(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate normalized embedding vectors for a batch of texts."""
        if not self.is_loaded:
            self.load()

        if self.is_loaded and self.model is not None:
            embeddings = self.model.encode(texts, convert_to_numpy=True, normalize_embeddings=True, batch_size=32)
            return embeddings.tolist()
        else:
            return [self._fallback_embed(t) for t in texts]

    def _fallback_embed(self, text: str, dim: int = 384) -> List[float]:
        """Fallback deterministic pseudo-embedding when model is offline."""
        import hashlib
        vec = np.zeros(dim, dtype=np.float32)
        words = text.lower().split()
        for i, word in enumerate(words):
            h = int(hashlib.md5(word.encode()).hexdigest(), 16)
            idx = h % dim
            vec[idx] += 1.0 / (i + 1.0)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec /= norm
        return vec.tolist()


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService.get_instance()
