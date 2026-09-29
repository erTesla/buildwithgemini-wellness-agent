package com.whohum.wellness

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.whohum.wellness.domain.models.*
import com.whohum.wellness.theme.WellnessTheme
import com.whohum.wellness.ui.components.BottomNavigationBar
import com.whohum.wellness.ui.components.MobileTab
import com.whohum.wellness.ui.screens.*

@Composable
fun MainApp(
    initialTab: MobileTab = MobileTab.TODAY
) {
    var currentTab by remember { mutableStateOf(initialTab) }
    var companionType by remember { mutableStateOf(CompanionType.PUPPY) }
    var tasks by remember {
        mutableStateOf(
            listOf(
                TaskItem(
                    id = "task_1",
                    userId = "user_me",
                    title = "15-minute nature walk without phone",
                    priority = TaskPriority.HIGH,
                    estimatedDurationMinutes = 15,
                    minEnergyRequired = 2,
                    createdAt = "2026-09-29T08:00:00Z"
                ),
                TaskItem(
                    id = "task_2",
                    userId = "user_me",
                    title = "Drink warm cup of water & stretch",
                    priority = TaskPriority.MEDIUM,
                    estimatedDurationMinutes = 5,
                    minEnergyRequired = 1,
                    createdAt = "2026-09-29T08:30:00Z"
                )
            )
        )
    }

    var checkins by remember {
        mutableStateOf(
            listOf(
                WellnessCheckIn(
                    id = "chk_1",
                    userId = "user_me",
                    mood = MoodLevel.GOOD,
                    energyLevel = 4,
                    sleepQuality = 4,
                    journalText = "Woke up feeling steady and rested.",
                    source = CheckInSource.MANUAL,
                    timestamp = "2026-09-29T08:30:00Z"
                ),
                WellnessCheckIn(
                    id = "chk_2",
                    userId = "user_me",
                    mood = MoodLevel.THRIVING,
                    energyLevel = 5,
                    sleepQuality = 4,
                    journalText = "I bought a cycle today!",
                    aiSummary = "Reflected during companion conversation: User bought a cycle and felt immense joy.",
                    source = CheckInSource.CHAT,
                    timestamp = "2026-09-29T13:15:00Z"
                )
            )
        )
    }

    var hobbies by remember {
        mutableStateOf(
            listOf(
                HobbyItem(
                    id = "hob_1",
                    userId = "user_me",
                    name = "Outdoor Cycling",
                    category = "active",
                    frequencyPerWeek = 3,
                    streakWeeks = 4,
                    startedAt = "2026-09-01T00:00:00Z"
                ),
                HobbyItem(
                    id = "hob_2",
                    userId = "user_me",
                    name = "Watercolor Sketching",
                    category = "creative",
                    frequencyPerWeek = 2,
                    streakWeeks = 2,
                    startedAt = "2026-09-10T00:00:00Z"
                )
            )
        )
    }

    WellnessTheme {
        Scaffold(
            bottomBar = {
                BottomNavigationBar(
                    currentTab = currentTab,
                    onTabSelected = { currentTab = it }
                )
            }
        ) { paddingValues ->
            Box(modifier = Modifier.padding(paddingValues)) {
                when (currentTab) {
                    MobileTab.TODAY -> TodayScreen(
                        companionType = companionType,
                        tasks = tasks,
                        onMoodSelected = { mood ->
                            val newCheckin = WellnessCheckIn(
                                id = "chk_${checkins.size + 1}",
                                userId = "user_me",
                                mood = mood,
                                energyLevel = if (mood == MoodLevel.THRIVING) 5 else if (mood == MoodLevel.GOOD) 4 else 3,
                                source = CheckInSource.MANUAL,
                                timestamp = "now"
                            )
                            checkins = listOf(newCheckin) + checkins
                        },
                        onToggleTask = { taskId ->
                            tasks = tasks.map { t ->
                                if (t.id == taskId) {
                                    val nextStatus = if (t.status == TaskStatus.PENDING) TaskStatus.COMPLETED else TaskStatus.PENDING
                                    t.copy(status = nextStatus)
                                } else t
                            }
                        },
                        onNavigateToChat = { currentTab = MobileTab.CHAT }
                    )

                    MobileTab.CHAT -> ChatScreen(
                        companionType = companionType,
                        userId = "user_me",
                        onCheckInLogged = { loggedCheckin ->
                            checkins = listOf(loggedCheckin) + checkins
                        }
                    )

                    MobileTab.TASKS -> TasksScreen(
                        tasks = tasks,
                        onToggleTask = { taskId ->
                            tasks = tasks.map { t ->
                                if (t.id == taskId) {
                                    val nextStatus = if (t.status == TaskStatus.PENDING) TaskStatus.COMPLETED else TaskStatus.PENDING
                                    t.copy(status = nextStatus)
                                } else t
                            }
                        }
                    )

                    MobileTab.ACTIVITIES -> ActivitiesScreen(
                        hobbies = hobbies,
                        onAddAsTask = { title ->
                            val newTask = TaskItem(
                                id = "task_${tasks.size + 1}",
                                userId = "user_me",
                                title = title,
                                priority = TaskPriority.MEDIUM,
                                createdAt = "now"
                            )
                            tasks = tasks + newTask
                            currentTab = MobileTab.TASKS
                        }
                    )

                    MobileTab.INSIGHTS -> InsightsScreen(
                        checkins = checkins
                    )
                }
            }
        }
    }
}
