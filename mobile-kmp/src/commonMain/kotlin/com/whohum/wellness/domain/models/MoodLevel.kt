package com.whohum.wellness.domain.models

import kotlinx.serialization.Serializable

@Serializable
enum class MoodLevel(
    val label: String,
    val emoji: String,
    val description: String,
    val hexColor: Long
) {
    THRIVING("Thriving", "🌟", "Energized & Joyful", 0xFF10B981),
    GOOD("Good", "😊", "Calm & Steady", 0xFF0D9488),
    OKAY("Okay", "😐", "Neutral & Balanced", 0xFFF59E0B),
    LOW("Low", "🌧️", "Needing Quiet Rest", 0xFFF43F5E),
    OVERWHELMED("Overwhelmed", "⚠️", "High Stress", 0xFFE11D48);

    companion object {
        fun fromString(value: String): MoodLevel {
            return entries.find { it.name.equals(value, ignoreCase = true) } ?: GOOD
        }
    }
}
