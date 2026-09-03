"""
Tokenizer wrapper for DeBERTa-v3-base.

Provides a consistent tokenization interface for both training and inference.
"""

import logging

from transformers import AutoTokenizer

from ml.config import MLConfig

logger = logging.getLogger(__name__)


def get_tokenizer(config: MLConfig = None) -> AutoTokenizer:
    """Load the tokenizer for the configured model.

    Args:
        config: ML configuration. Defaults to MLConfig().

    Returns:
        AutoTokenizer instance.
    """
    if config is None:
        config = MLConfig()

    logger.info(f"Loading tokenizer: {config.MODEL_NAME}")
    tokenizer = AutoTokenizer.from_pretrained(config.MODEL_NAME)
    return tokenizer


def tokenize_dataset(dataset, tokenizer, config: MLConfig = None):
    """Tokenize an entire dataset.

    Args:
        dataset: HuggingFace Dataset with 'text' column.
        tokenizer: AutoTokenizer instance.
        config: ML configuration.

    Returns:
        Tokenized dataset with input_ids, attention_mask, and label columns.
    """
    if config is None:
        config = MLConfig()

    def tokenize_fn(examples):
        return tokenizer(
            examples["text"],
            truncation=True,
            max_length=config.MAX_LENGTH,
            padding="max_length",
        )

    tokenized = dataset.map(
        tokenize_fn,
        batched=True,
        desc="Tokenizing",
        remove_columns=["text", "original_label"],
    )

    # Set format for PyTorch
    tokenized.set_format("torch")

    return tokenized
