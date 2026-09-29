package com.whohum.wellness.notifications

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.whohum.wellness.domain.notifications.PlatformNotificationScheduler
import com.whohum.wellness.domain.notifications.ScheduledCheckInReminder
import java.util.Calendar

class AndroidNotificationScheduler(
    private val context: Context
) : PlatformNotificationScheduler {

    private val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    override fun scheduleAllDailyCheckIns(reminders: List<ScheduledCheckInReminder>) {
        reminders.forEachIndexed { index, reminder ->
            val calendar = Calendar.getInstance().apply {
                timeInMillis = System.currentTimeMillis()
                set(Calendar.HOUR_OF_DAY, reminder.hour)
                set(Calendar.MINUTE, reminder.minute)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)

                // If scheduled time has already passed today, set for tomorrow
                if (before(Calendar.getInstance())) {
                    add(Calendar.DAY_OF_YEAR, 1)
                }
            }

            val intent = Intent(context, AndroidNotificationReceiver::class.java).apply {
                action = "com.whohum.wellness.ACTION_CHECKIN_ALARM"
                putExtra("title", reminder.title)
                putExtra("message", reminder.message)
                putExtra("slot", reminder.slot.name)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                index + 1000,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            }
        }
    }

    override fun cancelAllCheckIns() {
        for (i in 0..3) {
            val intent = Intent(context, AndroidNotificationReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                i + 1000,
                intent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            if (pendingIntent != null) {
                alarmManager.cancel(pendingIntent)
            }
        }
    }

    override fun isPermissionGranted(): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            androidx.core.content.ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    override fun requestPermission(onResult: (Boolean) -> Unit) {
        onResult(isPermissionGranted())
    }
}
