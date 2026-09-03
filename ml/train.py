"""
FactSight ML Training Pipeline — Main Entry Point

Usage:
    python -m ml.train                    # Run with defaults
    python -m ml.train --inspect-only     # Only inspect dataset, don't train
    python -m ml.train --epochs 5         # Override num epochs
    python -m ml.train --batch-size 8     # Override batch size

Pipeline:
1. Inspect dataset
2. Load and prepare data (map labels)
3. Tokenize
4. Compute class weights
5. Load pretrained model
6. Train with evaluation
7. Evaluate on test set
8. Save best model + evaluation report
"""

import argparse
import logging
import sys
import os
import random

import numpy as np
import torch

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.config import MLConfig
from ml.data.dataset_loader import inspect_dataset, load_and_prepare_dataset, get_class_weights
from ml.preprocessing.tokenizer import get_tokenizer, tokenize_dataset
from ml.training.trainer import load_model_for_training, create_trainer
from ml.evaluation.evaluator import evaluate_model, save_evaluation_report, print_evaluation_report

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def set_seed(seed: int):
    """Set random seed for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)
    logger.info(f"Random seed set to {seed}")


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="FactSight ML Training Pipeline")
    parser.add_argument(
        "--inspect-only",
        action="store_true",
        help="Only inspect the dataset without training",
    )
    parser.add_argument("--epochs", type=int, default=None, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=None, help="Training batch size")
    parser.add_argument("--lr", type=float, default=None, help="Learning rate")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    parser.add_argument(
        "--no-class-weights",
        action="store_true",
        help="Disable class weights",
    )
    return parser.parse_args()


def main():
    """Run the full training pipeline."""
    args = parse_args()
    config = MLConfig.from_env()

    # Override config with CLI args
    if args.epochs is not None:
        config.NUM_EPOCHS = args.epochs
    if args.batch_size is not None:
        config.BATCH_SIZE = args.batch_size
    if args.lr is not None:
        config.LEARNING_RATE = args.lr
    if args.seed is not None:
        config.SEED = args.seed
    if args.no_class_weights:
        config.USE_CLASS_WEIGHTS = False

    set_seed(config.SEED)

    # ==========================================
    # Step 1: Inspect Dataset
    # ==========================================
    print("\n" + "=" * 60)
    print("STEP 1: DATASET INSPECTION")
    print("=" * 60)

    info = inspect_dataset(config)
    print(f"\nDataset: {info['dataset_name']}")
    print(f"Original labels: {info['label_info'].get('names', 'N/A')}")

    for split, data in info["splits"].items():
        print(f"\n{split}: {data['num_samples']} samples")
        if "label_distribution" in data:
            print(f"  Distribution: {data['label_distribution']}")

    if "sample" in info:
        print(f"\nSample: {info['sample']}")

    if args.inspect_only:
        print("\n--inspect-only flag set. Exiting.")
        return

    # ==========================================
    # Step 2: Load and Prepare Data
    # ==========================================
    print("\n" + "=" * 60)
    print("STEP 2: DATA PREPARATION")
    print("=" * 60)

    dataset = load_and_prepare_dataset(config)

    print(f"\nPrepared splits:")
    for split_name in dataset:
        print(f"  {split_name}: {len(dataset[split_name])} samples")

    # ==========================================
    # Step 3: Tokenize
    # ==========================================
    print("\n" + "=" * 60)
    print("STEP 3: TOKENIZATION")
    print("=" * 60)

    tokenizer = get_tokenizer(config)

    tokenized_train = tokenize_dataset(dataset["train"], tokenizer, config)
    tokenized_val = tokenize_dataset(dataset["validation"], tokenizer, config)
    tokenized_test = tokenize_dataset(dataset["test"], tokenizer, config)

    print(f"Tokenized train: {len(tokenized_train)} samples")
    print(f"Tokenized validation: {len(tokenized_val)} samples")
    print(f"Tokenized test: {len(tokenized_test)} samples")

    # ==========================================
    # Step 4: Class Weights
    # ==========================================
    print("\n" + "=" * 60)
    print("STEP 4: CLASS WEIGHTS")
    print("=" * 60)

    class_weights = None
    if config.USE_CLASS_WEIGHTS:
        class_weights = get_class_weights(dataset["train"], config)
        print(f"Class weights: {class_weights}")
    else:
        print("Class weights disabled.")

    # ==========================================
    # Step 5: Load Model
    # ==========================================
    print("\n" + "=" * 60)
    print("STEP 5: MODEL LOADING")
    print("=" * 60)

    model = load_model_for_training(config)
    print(f"Model: {config.MODEL_NAME}")
    print(f"Num labels: {config.NUM_LABELS}")
    print(f"Device: {'cuda' if torch.cuda.is_available() else 'cpu'}")

    # ==========================================
    # Step 6: Train
    # ==========================================
    print("\n" + "=" * 60)
    print("STEP 6: TRAINING")
    print("=" * 60)

    print(f"Epochs: {config.NUM_EPOCHS}")
    print(f"Batch size: {config.BATCH_SIZE}")
    print(f"Learning rate: {config.LEARNING_RATE}")
    print(f"Output dir: {config.OUTPUT_DIR}")

    trainer = create_trainer(
        model=model,
        tokenized_train=tokenized_train,
        tokenized_val=tokenized_val,
        config=config,
        class_weights=class_weights,
    )

    train_result = trainer.train()
    print(f"\nTraining complete!")
    print(f"  Training loss: {train_result.training_loss:.4f}")

    # Save the best model and tokenizer
    trainer.save_model(str(config.OUTPUT_DIR))
    tokenizer.save_pretrained(str(config.OUTPUT_DIR))
    print(f"  Model saved to: {config.OUTPUT_DIR}")

    # ==========================================
    # Step 7: Evaluate
    # ==========================================
    print("\n" + "=" * 60)
    print("STEP 7: EVALUATION")
    print("=" * 60)

    results = evaluate_model(trainer, tokenized_test, config)
    print_evaluation_report(results)

    # Save report
    report_path = save_evaluation_report(results, config)
    print(f"\nEvaluation report saved to: {report_path}")

    # ==========================================
    # Summary
    # ==========================================
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)
    print(f"\nModel saved to: {config.OUTPUT_DIR}")
    print(f"Evaluation report: {report_path}")
    print(f"\nTo use this model in the backend:")
    print(f"  Set MODEL_PATH={config.OUTPUT_DIR} in your .env file")
    print(f"  Set MODEL_VERSION=deberta-v3-base-finetuned-v1")


if __name__ == "__main__":
    main()
