"""
Predictor — Standalone inference module for the fine-tuned model.

Can be used independently of the FastAPI backend for batch predictions,
testing, or integration into other pipelines.
"""

import logging
from pathlib import Path
from typing import Optional

import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from ml.config import MLConfig

logger = logging.getLogger(__name__)


class Predictor:
    """Standalone predictor for the fine-tuned misinformation detection model."""

    def __init__(self, model_path: Optional[str] = None, config: MLConfig = None):
        """Initialize the predictor.

        Args:
            model_path: Path to the fine-tuned model directory.
                        Defaults to config.OUTPUT_DIR.
            config: ML configuration.
        """
        if config is None:
            config = MLConfig()

        self.config = config
        self.model_path = model_path or str(config.OUTPUT_DIR)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.tokenizer = None
        self.is_loaded = False

    def load(self) -> None:
        """Load the model and tokenizer."""
        logger.info(f"Loading model from: {self.model_path}")

        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.model_path)
        self.model.to(self.device)
        self.model.eval()
        self.is_loaded = True

        logger.info(f"Model loaded on {self.device}")

    def predict(self, text: str) -> dict:
        """Predict the class of a single text.

        Args:
            text: Input text to classify.

        Returns:
            dict with: classification, confidence, all_probabilities
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
            max_length=self.config.MAX_LENGTH,
            padding=True,
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model(**inputs)
            probs = F.softmax(outputs.logits, dim=-1).squeeze()

        max_prob, pred_idx = torch.max(probs, dim=-1)

        all_probs = {
            self.config.ID_TO_LABEL[i]: round(probs[i].item(), 4)
            for i in range(self.config.NUM_LABELS)
        }

        return {
            "classification": self.config.ID_TO_LABEL[pred_idx.item()],
            "confidence": round(max_prob.item(), 4),
            "all_probabilities": all_probs,
        }

    def predict_batch(self, texts: list[str], batch_size: int = 32) -> list[dict]:
        """Predict classes for a batch of texts.

        Args:
            texts: List of input texts.
            batch_size: Batch size for inference.

        Returns:
            List of prediction dicts.
        """
        if not self.is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")

        results = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            inputs = self.tokenizer(
                batch,
                return_tensors="pt",
                truncation=True,
                max_length=self.config.MAX_LENGTH,
                padding=True,
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}

            with torch.no_grad():
                outputs = self.model(**inputs)
                probs = F.softmax(outputs.logits, dim=-1)

            for j in range(len(batch)):
                prob = probs[j]
                max_prob, pred_idx = torch.max(prob, dim=-1)

                all_probs = {
                    self.config.ID_TO_LABEL[k]: round(prob[k].item(), 4)
                    for k in range(self.config.NUM_LABELS)
                }

                results.append({
                    "classification": self.config.ID_TO_LABEL[pred_idx.item()],
                    "confidence": round(max_prob.item(), 4),
                    "all_probabilities": all_probs,
                })

        return results


if __name__ == "__main__":
    """Run standalone inference for testing."""
    logging.basicConfig(level=logging.INFO)

    test_claims = [
        "The earth is flat and NASA is covering it up.",
        "Water boils at 100 degrees Celsius at sea level.",
        "COVID-19 vaccines contain microchips.",
        "The United States declared independence in 1776.",
        "5G towers cause cancer and spread viruses.",
    ]

    predictor = Predictor()
    predictor.load()

    print("\n" + "=" * 60)
    print("INFERENCE RESULTS")
    print("=" * 60)

    for claim in test_claims:
        result = predictor.predict(claim)
        print(f"\nClaim: {claim}")
        print(f"  Classification: {result['classification']}")
        print(f"  Confidence: {result['confidence']:.4f}")
        print(f"  Probabilities: {result['all_probabilities']}")
