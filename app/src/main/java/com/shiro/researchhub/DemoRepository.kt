package com.shiro.researchhub

object DemoRepository {
    fun items(): List<ResearchItem> = listOf(
        ResearchItem(1, "LLM Hallucination Study", "AI Safety", ResearchType.PAPER, 3, 40, 4, "Compare mitigation techniques and benchmark sets."),
        ResearchItem(2, "Edge Vision Optimizer", "Computer Vision", ResearchType.PROJECT, 2, 65, 9, "Quantize and measure latency on mid-tier devices."),
        ResearchItem(3, "Graph Retrieval Notes", "Knowledge Graph", ResearchType.IDEA, 1, 15, 14, "Explore citation-aware retrieval strategy."),
        ResearchItem(4, "Write Methods Section", "NLP", ResearchType.TODO, 3, 20, 2, "Finalize experiment setup and hyper-parameters."),
        ResearchItem(5, "Federated Learning Survey", "Distributed ML", ResearchType.PAPER, 2, 75, 7, "Map open challenges in non-IID settings."),
        ResearchItem(6, "Dataset Audit", "Data Quality", ResearchType.TODO, 2, 50, 1, "Check leakage, imbalance, and duplication."),
        ResearchItem(7, "Audio Emotion Classifier", "Speech", ResearchType.PROJECT, 1, 30, 12, "Build baseline with augmentation pipeline."),
        ResearchItem(8, "Prompt Lab", "Prompt Engineering", ResearchType.IDEA, 1, 10, 21, "Create prompt templates for coding + summarization."),
        ResearchItem(9, "Ablation Table", "Experiment Tracking", ResearchType.TODO, 3, 5, 3, "Prepare clean comparison table before submission."),
        ResearchItem(10, "Diffusion Compression", "Generative AI", ResearchType.PAPER, 2, 55, 6, "Evaluate parameter-efficient distillation strategy.")
    )
}
