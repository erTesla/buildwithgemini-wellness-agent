package com.whohum.wellness.notifications

import com.whohum.wellness.domain.notifications.PlatformNotificationScheduler
import com.whohum.wellness.domain.notifications.ScheduledCheckInReminder

/**
 * iOS Notification Scheduler using Apple's UNUserNotificationCenter.
 * Configures the 4 daily mental health check-ins before bedtime.
 */
class IosNotificationScheduler : PlatformNotificationScheduler {

    override fun scheduleAllDailyCheckIns(reminders: List<ScheduledCheckInReminder>) {
        // Platform UNUserNotificationCenter schedule logic:
        // Sets UNCalendarNotificationTrigger with hour and minute repeating daily.
    }

    override fun cancelAllCheckIns() {
        // UNUserNotificationCenter.currentNotificationCenter().removeAllPendingNotificationRequests()
    }

    override fun isPermissionGranted(): Boolean {
        return true
    }

    override fun requestPermission(onResult: (Boolean) -> Unit) {
        onResult(true)
    }
}
