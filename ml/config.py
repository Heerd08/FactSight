"""
ML Pipeline Configuration.

All training hyperparameters and paths are centralized here.
Can be overridden via environment variables or command-line arguments.
"""

import os
from pathlib import Path


class MLConfig:
    """Configuration for the ML training pipeline."""

    # Model
    MODEL_NAME: str = "microsoft/deberta-v3-base"
    NUM_LABELS: int = 3  # Genuine, Misleading, Fake

    # Dataset
    DATASET_NAME: str = "UKPLab/liar"  # HuggingFace dataset identifier (standard parquet format)
    TEXT_COLUMN: str = "text"  # Column containing the text

    # Label mapping: maps dataset labels -> our application scheme
    # Supports both UKPLab/liar format ('true statement', 'false statement') and standard 6-class LIAR
    LABEL_NAMES: list[str] = ["Genuine", "Misleading", "Fake"]

    LIAR_LABEL_MAP: dict[str, str] = {
        # UKPLab/liar labels
        "true statement": "Genuine",
        "false statement": "Fake",
        # Standard 6-class LIAR labels
        "true": "Genuine",
        "mostly-true": "Genuine",
        "half-true": "Misleading",
        "barely-true": "Misleading",
        "false": "Fake",
        "pants-fire": "Fake",
    }

    # Our labels → integer indices for the model
    LABEL_TO_ID: dict[str, int] = {
        "Genuine": 0,
        "Misleading": 1,
        "Fake": 2,
    }
    ID_TO_LABEL: dict[int, str] = {v: k for k, v in LABEL_TO_ID.items()}

    # Training hyperparameters
    SEED: int = 42
    MAX_LENGTH: int = 512
    BATCH_SIZE: int = 16
    LEARNING_RATE: float = 2e-5
    NUM_EPOCHS: int = 3
    WEIGHT_DECAY: float = 0.01
    WARMUP_RATIO: float = 0.1
    EVAL_STRATEGY: str = "epoch"
    SAVE_STRATEGY: str = "epoch"
    LOAD_BEST_MODEL_AT_END: bool = True
    METRIC_FOR_BEST_MODEL: str = "f1_weighted"
    EARLY_STOPPING_PATIENCE: int = 2

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent
    OUTPUT_DIR: Path = BASE_DIR / "models" / "deberta-v3-base-finetuned"
    LOGGING_DIR: Path = BASE_DIR / "models" / "logs"
    EVALUATION_DIR: Path = BASE_DIR / "models" / "evaluation"

    # Class weights (set to True to handle class imbalance)
    USE_CLASS_WEIGHTS: bool = True

    @classmethod
    def from_env(cls) -> "MLConfig":
        """Create config with environment variable overrides."""
        config = cls()
        config.BATCH_SIZE = int(os.getenv("ML_BATCH_SIZE", str(config.BATCH_SIZE)))
        config.NUM_EPOCHS = int(os.getenv("ML_NUM_EPOCHS", str(config.NUM_EPOCHS)))
        config.LEARNING_RATE = float(os.getenv("ML_LEARNING_RATE", str(config.LEARNING_RATE)))
        config.SEED = int(os.getenv("ML_SEED", str(config.SEED)))
        return config
