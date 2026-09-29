package com.whohum.wellness.domain.models

import kotlinx.serialization.Serializable

@Serializable
enum class HobbyStatus {
    ACTIVE,
    PAUSED,
    EXPLORING
}

@Serializable
data class HobbyItem(
    val id: String,
    val userId: String,
    val name: String,
    val category: String = "creative",
    val status: HobbyStatus = HobbyStatus.ACTIVE,
    val frequencyPerWeek: Int = 2,
    val streakWeeks: Int = 1,
    val estimatedCost: String = "low",
    val startedAt: String
)
