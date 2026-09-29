package com.whohum.wellness.domain.models

import kotlinx.serialization.Serializable

@Serializable
enum class CheckInSource {
    MANUAL,
    CHAT
}

@Serializable
data class WellnessCheckIn(
    val id: String,
    val userId: String,
    val mood: MoodLevel,
    val energyLevel: Int = 3,       // 1..5
    val stressLevel: Int = 2,       // 1..5
    val sleepQuality: Int = 4,      // 1..5
    val journalText: String? = null,
    val aiSummary: String? = null,
    val source: CheckInSource = CheckInSource.MANUAL,
    val timestamp: String
)
