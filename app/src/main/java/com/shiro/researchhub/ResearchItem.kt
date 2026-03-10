package com.shiro.researchhub

enum class ResearchType { PAPER, PROJECT, IDEA, TODO }

data class ResearchItem(
    val id: Long,
    val title: String,
    val topic: String,
    val type: ResearchType,
    val priority: Int,
    val progress: Int,
    val dueInDays: Int,
    val notes: String
)
