"""
Training module — Fine-tunes DeBERTa-v3-base on the prepared dataset.

Uses HuggingFace Trainer with:
- Class-weighted loss for imbalance handling
- Early stopping
- Best model checkpoint saving
- Weighted F1 as the primary metric
"""

import logging
import numpy as np
import torch
import torch.nn as nn

from transformers import (
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

from ml.config import MLConfig

logger = logging.getLogger(__name__)


def compute_metrics(eval_pred):
    """Compute metrics for the Trainer.

    Args:
        eval_pred: EvalPrediction with predictions and label_ids.

    Returns:
        dict of metric names → values.
    """
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)

    accuracy = accuracy_score(labels, predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average="weighted", zero_division=0
    )
    precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
        labels, predictions, average="macro", zero_division=0
    )

    return {
        "accuracy": accuracy,
        "f1_weighted": f1,
        "precision_weighted": precision,
        "recall_weighted": recall,
        "f1_macro": f1_macro,
        "precision_macro": precision_macro,
        "recall_macro": recall_macro,
    }


class WeightedTrainer(Trainer):
    """Trainer subclass that supports class-weighted cross-entropy loss."""

    def __init__(self, class_weights=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if class_weights is not None:
            self.class_weights = torch.tensor(class_weights, dtype=torch.float32)
        else:
            self.class_weights = None

    def compute_loss(self, model, inputs, return_outputs=False, **kwargs):
        """Compute weighted cross-entropy loss."""
        labels = inputs.pop("labels")
        outputs = model(**inputs)
        logits = outputs.logits

        if self.class_weights is not None:
            weight = self.class_weights.to(logits.device)
            loss_fn = nn.CrossEntropyLoss(weight=weight)
        else:
            loss_fn = nn.CrossEntropyLoss()

        loss = loss_fn(logits, labels)
        return (loss, outputs) if return_outputs else loss


def create_trainer(
    model,
    tokenized_train,
    tokenized_val,
    config: MLConfig = None,
    class_weights: list[float] = None,
) -> Trainer:
    """Create a HuggingFace Trainer configured for fine-tuning.

    Args:
        model: The pretrained model.
        tokenized_train: Tokenized training dataset.
        tokenized_val: Tokenized validation dataset.
        config: ML configuration.
        class_weights: Optional class weights for imbalance handling.

    Returns:
        Configured Trainer instance.
    """
    if config is None:
        config = MLConfig()

    training_args = TrainingArguments(
        output_dir=str(config.OUTPUT_DIR),
        num_train_epochs=config.NUM_EPOCHS,
        per_device_train_batch_size=config.BATCH_SIZE,
        per_device_eval_batch_size=config.BATCH_SIZE * 2,
        learning_rate=config.LEARNING_RATE,
        weight_decay=config.WEIGHT_DECAY,
        warmup_ratio=config.WARMUP_RATIO,
        eval_strategy=config.EVAL_STRATEGY,
        save_strategy=config.SAVE_STRATEGY,
        load_best_model_at_end=config.LOAD_BEST_MODEL_AT_END,
        metric_for_best_model=config.METRIC_FOR_BEST_MODEL,
        greater_is_better=True,
        logging_dir=str(config.LOGGING_DIR),
        logging_steps=50,
        seed=config.SEED,
        fp16=torch.cuda.is_available(),
        report_to="none",  # Disable wandb/tensorboard for hackathon
        save_total_limit=2,
    )

    callbacks = [
        EarlyStoppingCallback(early_stopping_patience=config.EARLY_STOPPING_PATIENCE),
    ]

    if class_weights is not None:
        trainer = WeightedTrainer(
            class_weights=class_weights,
            model=model,
            args=training_args,
            train_dataset=tokenized_train,
            eval_dataset=tokenized_val,
            compute_metrics=compute_metrics,
            callbacks=callbacks,
        )
    else:
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=tokenized_train,
            eval_dataset=tokenized_val,
            compute_metrics=compute_metrics,
            callbacks=callbacks,
        )

    return trainer


def load_model_for_training(config: MLConfig = None):
    """Load the pretrained model configured for our classification task.

    Args:
        config: ML configuration.

    Returns:
        AutoModelForSequenceClassification instance.
    """
    if config is None:
        config = MLConfig()

    logger.info(f"Loading model for training: {config.MODEL_NAME}")
    model = AutoModelForSequenceClassification.from_pretrained(
        config.MODEL_NAME,
        num_labels=config.NUM_LABELS,
        id2label=config.ID_TO_LABEL,
        label2id=config.LABEL_TO_ID,
        ignore_mismatched_sizes=True,
    )

    return model
