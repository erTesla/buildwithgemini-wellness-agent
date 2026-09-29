package com.whohum.wellness.domain.models

import kotlinx.serialization.Serializable

@Serializable
data class UserPreferences(
    val userId: String = "default_user",
    val notificationsEnabled: Boolean = true,
    val wakeHour: Int = 8,
    val wakeMinute: Int = 30,
    val bedtimeHour: Int = 22,
    val bedtimeMinute: Int = 0,
    val soundEnabled: Boolean = true,
    val companionType: CompanionType = CompanionType.PUPPY,
    val themeMode: String = "light"
)
