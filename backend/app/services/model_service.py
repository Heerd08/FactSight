"""
Model Service — Singleton that loads and manages the DeBERTa model.

Handles:
- Model loading (from HuggingFace hub or local checkpoint)
- Inference (text → classification + confidence)
- Label mapping
"""

import logging
from typing import Optional

import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from app.core.config import settings

logger = logging.getLogger(__name__)


class ModelService:
    """Singleton service for managing the ML model lifecycle."""

    _instance: Optional["ModelService"] = None

    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.is_loaded = False
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.label_map = settings.LABEL_MAP  # ["Genuine", "Misleading", "Fake"]
        self.model_version = settings.MODEL_VERSION
        self.confidence_threshold = settings.CONFIDENCE_THRESHOLD

    @classmethod
    def get_instance(cls) -> "ModelService":
        """Get or create the singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self, model_path: Optional[str] = None) -> None:
        """Load the model and tokenizer.

        Args:
            model_path: Path to model (HuggingFace ID or local directory).
                        Defaults to settings.MODEL_PATH.
        """
        path = model_path or settings.MODEL_PATH
        num_labels = len(self.label_map)

        logger.info(f"Loading model from: {path}")
        logger.info(f"Device: {self.device}")
        logger.info(f"Labels ({num_labels}): {self.label_map}")

        try:
            self.tokenizer = AutoTokenizer.from_pretrained(path)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                path,
                num_labels=num_labels,
                ignore_mismatched_sizes=True,  # Allow loading base model with different head
            )
            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.is_loaded = False
            raise

    def predict(self, text: str) -> dict:
        """Run inference on a single text.

        Args:
            text: The input text to classify.

        Returns:
            dict with keys:
                - classification: str (label name or "Unverified")
                - confidence: float (0.0 to 1.0)
                - all_probabilities: dict[str, float] (label → probability)
                - model_version: str
        """
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded. Call load_model() first.")

        # Tokenize
        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Inference
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = F.softmax(logits, dim=-1).squeeze()

        # Get prediction
        max_prob, predicted_idx = torch.max(probabilities, dim=-1)
        confidence = max_prob.item()
        predicted_idx = predicted_idx.item()

        # Build probability map for all labels
        all_probs = {}
        for i, label in enumerate(self.label_map):
            all_probs[label] = round(probabilities[i].item(), 4)

        # Apply confidence threshold — if below threshold, classify as Unverified
        if confidence < self.confidence_threshold:
            classification = "Unverified"
        else:
            classification = self.label_map[predicted_idx]

        return {
            "classification": classification,
            "confidence": round(confidence, 4),
            "all_probabilities": all_probs,
            "model_version": self.model_version,
        }

    def is_ready(self) -> bool:
        """Check if the model is loaded and ready for inference."""
        return self.is_loaded
