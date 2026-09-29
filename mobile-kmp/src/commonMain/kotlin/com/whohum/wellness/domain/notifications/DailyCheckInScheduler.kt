package com.whohum.wellness.domain.notifications

import com.whohum.wellness.domain.models.UserPreferences

enum class CheckInSlot(
    val slotName: String,
    val defaultHour: Int,
    val defaultMinute: Int,
    val title: String,
    val message: String
) {
    MORNING(
        slotName = "Morning Intention",
        defaultHour = 8,
        defaultMinute = 30,
        title = "Good morning! ☀️",
        message = "How did you sleep? Take 30 seconds with Who-Hum to set a gentle intention for today."
    ),
    MIDDAY(
        slotName = "Midday Reset",
        defaultHour = 13,
        defaultMinute = 0,
        title = "Midday Reset 🌿",
        message = "Time for a breather. How is your energy holding up? Step away for a gentle 5-minute pause."
    ),
    EVENING(
        slotName = "Evening Recharge",
        defaultHour = 18,
        defaultMinute = 0,
        title = "Evening Wind-Down 🌅",
        message = "Work wrap-up. Time to transition into evening with your favorite restorative activity."
    ),
    BEDTIME(
        slotName = "Bedtime Reflection",
        defaultHour = 21,
        defaultMinute = 30,
        title = "Quiet Reflection 🌙",
        message = "Unload today's thoughts with your companion before bed so you can rest peacefully tonight."
    )
}

data class ScheduledCheckInReminder(
    val slot: CheckInSlot,
    val hour: Int,
    val minute: Int,
    val title: String,
    val message: String
)

object DailyCheckInCalculator {

    /**
     * Calculates 4 timely reminders distributed naturally between wake-up and bedtime.
     * Guaranteed to finish before the user goes to bed!
     */
    fun calculateDailySchedule(prefs: UserPreferences): List<ScheduledCheckInReminder> {
        val wakeH = prefs.wakeHour.coerceIn(5, 11)
        val bedH = prefs.bedtimeHour.coerceIn(20, 24)
        val totalActiveHours = (bedH - wakeH).coerceAtLeast(8)
        val step = totalActiveHours / 3

        val morningTime = Pair(wakeH, prefs.wakeMinute)
        val middayTime = Pair(wakeH + step, 0)
        val eveningTime = Pair(wakeH + (step * 2), 0)
        val bedtimeTime = Pair((bedH - 1).coerceAtLeast(eveningTime.first + 1), 30)

        return listOf(
            ScheduledCheckInReminder(
                slot = CheckInSlot.MORNING,
                hour = morningTime.first,
                minute = morningTime.second,
                title = CheckInSlot.MORNING.title,
                message = CheckInSlot.MORNING.message
            ),
            ScheduledCheckInReminder(
                slot = CheckInSlot.MIDDAY,
                hour = middayTime.first,
                minute = middayTime.second,
                title = CheckInSlot.MIDDAY.title,
                message = CheckInSlot.MIDDAY.message
            ),
            ScheduledCheckInReminder(
                slot = CheckInSlot.EVENING,
                hour = eveningTime.first,
                minute = eveningTime.second,
                title = CheckInSlot.EVENING.title,
                message = CheckInSlot.EVENING.message
            ),
            ScheduledCheckInReminder(
                slot = CheckInSlot.BEDTIME,
                hour = bedtimeTime.first,
                minute = bedtimeTime.second,
                title = CheckInSlot.BEDTIME.title,
                message = CheckInSlot.BEDTIME.message
            )
        )
    }
}

/**
 * Common interface for native notification dispatchers.
 */
interface PlatformNotificationScheduler {
    fun scheduleAllDailyCheckIns(reminders: List<ScheduledCheckInReminder>)
    fun cancelAllCheckIns()
    fun isPermissionGranted(): Boolean
    fun requestPermission(onResult: (Boolean) -> Unit)
}
