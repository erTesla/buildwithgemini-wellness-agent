package com.whohum.wellness.domain.models

import kotlinx.serialization.Serializable

@Serializable
enum class CompanionType(
    val displayName: String,
    val subtitle: String,
    val primaryColorHex: Long
) {
    CAT("Cat", "Gentle Purr Companion", 0xFF64748B),
    RACOON("Racoon Dog", "Playful Tanuki Buddy", 0xFF854D0E),
    PUPPY("Dog", "Loyal Golden Puppy", 0xFFEAB308),
    TREX("T-Rex", "Sturdy & Protective", 0xFF059669),
    CLOUD_POTATO("Cloud Potato", "Warm Golden Fluff", 0xFFF59E0B),
    CLOUD_BLUEBERRY("Cloud Blueberry", "Dreamy Indigo Cloud", 0xFF4F46E5);

    companion object {
        fun fromId(id: String): CompanionType {
            return entries.find { it.name.equals(id, ignoreCase = true) } ?: PUPPY
        }
    }
}

@Serializable
enum class CompanionEmotion {
    IDLE,
    THINKING,
    SMILE,
    SAD
}
