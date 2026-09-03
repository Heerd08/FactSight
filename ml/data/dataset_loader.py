"""
Dataset Loader — Loads and inspects the LIAR dataset from HuggingFace.

The LIAR dataset contains ~12.8K short political statements from PolitiFact,
labeled with 6 truthfulness levels:
    pants-fire, false, barely-true, half-true, mostly-true, true

This module:
1. Loads the dataset
2. Inspects labels and distribution
3. Maps LIAR's 6 labels → our 3 labels (Genuine, Misleading, Fake)
4. Reports the mapping and any issues
5. Returns train/validation/test splits
"""

import logging
from collections import Counter

from datasets import load_dataset, DatasetDict

from ml.config import MLConfig

logger = logging.getLogger(__name__)


def inspect_dataset(config: MLConfig = None) -> dict:
    """Load and inspect the dataset. Returns metadata without modifying data."""
    if config is None:
        config = MLConfig()

    logger.info(f"Loading dataset: {config.DATASET_NAME}")
    dataset = load_dataset(config.DATASET_NAME)

    info = {
        "dataset_name": config.DATASET_NAME,
        "splits": {},
        "label_info": {},
    }

    for split_name in dataset:
        split = dataset[split_name]
        info["splits"][split_name] = {
            "num_samples": len(split),
            "columns": list(split.column_names),
        }

        # Inspect labels from label_text or label
        label_col = "label_text" if "label_text" in split.column_names else "label"
        if label_col in split.column_names:
            labels = split[label_col]
            counter = Counter(labels)
            info["splits"][split_name]["label_distribution"] = dict(counter)

        # Sample
        if split_name == "train":
            sample = split[0]
            info["sample"] = {k: str(v)[:200] for k, v in sample.items()}

    return info


def load_and_prepare_dataset(config: MLConfig = None) -> DatasetDict:
    """Load the dataset and map labels to our application scheme."""
    if config is None:
        config = MLConfig()

    logger.info(f"Loading dataset: {config.DATASET_NAME}")
    dataset = load_dataset(config.DATASET_NAME)

    # Determine text and label columns
    sample_split = dataset["train"]
    text_col = config.TEXT_COLUMN if config.TEXT_COLUMN in sample_split.column_names else "statement"
    label_col = "label_text" if "label_text" in sample_split.column_names else "label"

    logger.info(f"Using text column: '{text_col}', label column: '{label_col}'")
    logger.info(f"Label mapping dictionary: {config.LIAR_LABEL_MAP}")

    def map_labels(example):
        raw_val = example[label_col]
        # If integer label with class names
        if isinstance(raw_val, int):
            label_feature = sample_split.features.get(label_col)
            if hasattr(label_feature, "names"):
                raw_name = label_feature.names[raw_val]
            else:
                raw_name = str(raw_val)
        else:
            raw_name = str(raw_val)

        mapped_label_name = config.LIAR_LABEL_MAP.get(raw_name, "Misleading")
        mapped_idx = config.LABEL_TO_ID.get(mapped_label_name, 1)

        return {
            "text": str(example[text_col]),
            "label": mapped_idx,
            "original_label": raw_name,
        }

    # Apply mapping to all splits
    prepared = DatasetDict()
    for split_name in dataset:
        logger.info(f"Processing split: {split_name} ({len(dataset[split_name])} samples)")
        mapped = dataset[split_name].map(
            map_labels,
            remove_columns=dataset[split_name].column_names,
            desc=f"Mapping {split_name} labels",
        )
        prepared[split_name] = mapped

        # Report new distribution
        counter = Counter(mapped["label"])
        dist = {config.ID_TO_LABEL[k]: v for k, v in sorted(counter.items())}
        logger.info(f"  {split_name} distribution: {dist}")

    return prepared


def get_class_weights(dataset, config: MLConfig = None) -> list[float]:
    """Compute inverse frequency class weights for handling imbalance.

    Args:
        dataset: The training split with integer labels.
        config: ML configuration.

    Returns:
        list[float]: Weight for each class index.
    """
    if config is None:
        config = MLConfig()

    labels = dataset["label"]
    counter = Counter(labels)
    total = sum(counter.values())

    weights = []
    for i in range(config.NUM_LABELS):
        count = counter.get(i, 1)
        weight = total / (config.NUM_LABELS * count)
        weights.append(round(weight, 4))

    logger.info(f"Class weights: {weights}")
    return weights


if __name__ == "__main__":
    """Run standalone to inspect the dataset."""
    logging.basicConfig(level=logging.INFO)

    print("=" * 60)
    print("DATASET INSPECTION")
    print("=" * 60)

    info = inspect_dataset()

    print(f"\nDataset: {info['dataset_name']}")
    print(f"Label names: {info['label_info'].get('names', 'N/A')}")
    print(f"Num classes: {info['label_info'].get('num_classes', 'N/A')}")

    for split, data in info["splits"].items():
        print(f"\n{split}:")
        print(f"  Samples: {data['num_samples']}")
        if "label_distribution" in data:
            print(f"  Distribution: {data['label_distribution']}")

    if "sample" in info:
        print(f"\nSample: {info['sample']}")

    print("\n" + "=" * 60)
    print("PREPARED DATASET")
    print("=" * 60)

    prepared = load_and_prepare_dataset()
    for split_name in prepared:
        print(f"\n{split_name}: {len(prepared[split_name])} samples")
        print(f"  Columns: {prepared[split_name].column_names}")
        print(f"  Sample: {prepared[split_name][0]}")
