package com.whohum.wellness.domain.models

import kotlinx.serialization.Serializable

@Serializable
enum class TaskPriority {
    LOW,
    MEDIUM,
    HIGH
}

@Serializable
enum class TaskStatus {
    PENDING,
    COMPLETED
}

@Serializable
data class TaskItem(
    val id: String,
    val userId: String,
    val title: String,
    val priority: TaskPriority = TaskPriority.MEDIUM,
    val category: String = "wellness",
    val status: TaskStatus = TaskStatus.PENDING,
    val estimatedDurationMinutes: Int = 20,
    val minEnergyRequired: Int = 2,
    val isAIGenerated: Boolean = false,
    val proposedReason: String? = null,
    val createdAt: String
)
