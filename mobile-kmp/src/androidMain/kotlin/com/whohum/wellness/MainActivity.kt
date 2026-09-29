package com.whohum.wellness

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.whohum.wellness.domain.models.UserPreferences
import com.whohum.wellness.domain.notifications.DailyCheckInCalculator
import com.whohum.wellness.notifications.AndroidNotificationScheduler

class MainActivity : ComponentActivity() {

    private lateinit var notificationScheduler: AndroidNotificationScheduler

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize and schedule the 4 daily timely mental health check-ins
        notificationScheduler = AndroidNotificationScheduler(this)
        val defaultPrefs = UserPreferences()
        val reminders = DailyCheckInCalculator.calculateDailySchedule(defaultPrefs)
        notificationScheduler.scheduleAllDailyCheckIns(reminders)

        setContent {
            MainApp()
        }
    }
}
