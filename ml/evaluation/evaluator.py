"""
Evaluator — Computes and saves evaluation metrics for the trained model.

Metrics:
- Accuracy
- Precision (weighted and macro)
- Recall (weighted and macro)
- F1-score (weighted and macro)
- Confusion matrix
- Per-class metrics
"""

import json
import logging
from pathlib import Path

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    classification_report,
)

from ml.config import MLConfig

logger = logging.getLogger(__name__)


def evaluate_model(trainer, test_dataset, config: MLConfig = None) -> dict:
    """Run evaluation on the test set and compute all metrics.

    Args:
        trainer: Trained HuggingFace Trainer instance.
        test_dataset: Tokenized test dataset.
        config: ML configuration.

    Returns:
        dict containing all evaluation metrics.
    """
    if config is None:
        config = MLConfig()

    logger.info("Running evaluation on test set...")

    # Get predictions
    predictions = trainer.predict(test_dataset)
    preds = np.argmax(predictions.predictions, axis=-1)
    labels = predictions.label_ids

    # Compute metrics
    accuracy = accuracy_score(labels, preds)

    precision_w, recall_w, f1_w, _ = precision_recall_fscore_support(
        labels, preds, average="weighted", zero_division=0
    )
    precision_m, recall_m, f1_m, _ = precision_recall_fscore_support(
        labels, preds, average="macro", zero_division=0
    )

    # Per-class metrics
    precision_per, recall_per, f1_per, support_per = precision_recall_fscore_support(
        labels, preds, average=None, zero_division=0
    )

    # Confusion matrix
    cm = confusion_matrix(labels, preds)

    # Classification report
    report = classification_report(
        labels, preds,
        target_names=config.LABEL_NAMES,
        output_dict=True,
        zero_division=0,
    )

    results = {
        "model_name": config.MODEL_NAME,
        "dataset": config.DATASET_NAME,
        "num_test_samples": len(labels),
        "label_names": config.LABEL_NAMES,
        "overall_metrics": {
            "accuracy": round(accuracy, 4),
            "f1_weighted": round(f1_w, 4),
            "precision_weighted": round(precision_w, 4),
            "recall_weighted": round(recall_w, 4),
            "f1_macro": round(f1_m, 4),
            "precision_macro": round(precision_m, 4),
            "recall_macro": round(recall_m, 4),
        },
        "per_class_metrics": {},
        "confusion_matrix": cm.tolist(),
        "classification_report": report,
    }

    for i, label_name in enumerate(config.LABEL_NAMES):
        results["per_class_metrics"][label_name] = {
            "precision": round(float(precision_per[i]), 4),
            "recall": round(float(recall_per[i]), 4),
            "f1": round(float(f1_per[i]), 4),
            "support": int(support_per[i]),
        }

    return results


def save_evaluation_report(results: dict, config: MLConfig = None) -> Path:
    """Save the evaluation report to a JSON file.

    Args:
        results: Evaluation results dict.
        config: ML configuration.

    Returns:
        Path to the saved report file.
    """
    if config is None:
        config = MLConfig()

    config.EVALUATION_DIR.mkdir(parents=True, exist_ok=True)
    report_path = config.EVALUATION_DIR / "evaluation_report.json"

    with open(report_path, "w") as f:
        json.dump(results, f, indent=2)

    logger.info(f"Evaluation report saved to: {report_path}")
    return report_path


def print_evaluation_report(results: dict):
    """Print a formatted evaluation report to the console."""
    print("\n" + "=" * 60)
    print("EVALUATION REPORT")
    print("=" * 60)

    print(f"\nModel: {results['model_name']}")
    print(f"Dataset: {results['dataset']}")
    print(f"Test samples: {results['num_test_samples']}")

    print("\n--- Overall Metrics ---")
    for metric, value in results["overall_metrics"].items():
        print(f"  {metric}: {value:.4f}")

    print("\n--- Per-Class Metrics ---")
    for label, metrics in results["per_class_metrics"].items():
        print(f"\n  {label}:")
        for metric, value in metrics.items():
            print(f"    {metric}: {value}")

    print("\n--- Confusion Matrix ---")
    labels = results["label_names"]
    cm = results["confusion_matrix"]
    header = "        " + "  ".join(f"{l:>10}" for l in labels)
    print(header)
    for i, row in enumerate(cm):
        row_str = "  ".join(f"{v:>10}" for v in row)
        print(f"  {labels[i]:>6} {row_str}")

    print("\n" + "=" * 60)
