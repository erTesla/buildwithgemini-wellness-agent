package com.whohum.wellness.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.whohum.wellness.domain.models.*
import com.whohum.wellness.theme.WellnessColors
import com.whohum.wellness.ui.components.PixelCompanionCanvas

@Composable
fun TodayScreen(
    companionType: CompanionType,
    tasks: List<TaskItem>,
    onMoodSelected: (MoodLevel) -> Unit,
    onToggleTask: (String) -> Unit,
    onNavigateToChat: () -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(WellnessColors.Slate50)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Welcome Card with Pixel Companion
        item {
            Card(
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(24.dp))
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    PixelCompanionCanvas(
                        type = companionType,
                        emotion = CompanionEmotion.SMILE,
                        size = 56.dp
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Good day, buddy! 👋",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = WellnessColors.Slate900
                        )
                        Text(
                            text = "I'm with you all day. How are you feeling right now?",
                            fontSize = 13.sp,
                            color = WellnessColors.Slate600
                        )
                    }
                }
            }
        }

        // 2. 4x Daily Check-In Notification Schedule Banner
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = WellnessColors.EmeraldLight),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(18.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "🔔", fontSize = 16.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "4 Daily Health Pings Active",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = WellnessColors.EmeraldDark
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "• 08:30 Morning Intention  • 13:00 Midday Reset\n• 18:00 Evening Recharge   • 21:30 Bedtime Reflection",
                        fontSize = 12.sp,
                        color = WellnessColors.EmeraldDark,
                        lineHeight = 18.sp
                    )
                }
            }
        }

        // 3. 1-Tap Mood Logger
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(20.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Quick Mood Log",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = WellnessColors.Slate900
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        MoodLevel.entries.forEach { mood ->
                            Column(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { onMoodSelected(mood) }
                                    .background(WellnessColors.Slate50)
                                    .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(12.dp))
                                    .padding(vertical = 10.dp, horizontal = 8.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(text = mood.emoji, fontSize = 24.sp)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = mood.label,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = WellnessColors.Slate800
                                )
                            }
                        }
                    }
                }
            }
        }

        // 4. Focus Tasks List
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(20.dp))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Today's Focus Tasks",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = WellnessColors.Slate900
                        )
                        Text(
                            text = "${tasks.count { it.status == TaskStatus.COMPLETED }}/${tasks.size}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = WellnessColors.EmeraldPrimary
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    if (tasks.isEmpty()) {
                        Text(
                            text = "No tasks yet. Chat with your buddy to get matched daily suggestions!",
                            fontSize = 13.sp,
                            color = WellnessColors.Slate600
                        )
                    } else {
                        tasks.forEach { task ->
                            val isCompleted = task.status == TaskStatus.COMPLETED
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 6.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { onToggleTask(task.id) }
                                    .background(if (isCompleted) WellnessColors.Slate100 else WellnessColors.Slate50)
                                    .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(12.dp))
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = if (isCompleted) "✅" else "⭕",
                                    fontSize = 16.sp
                                )
                                Spacer(modifier = Modifier.width(12.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = task.title,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = if (isCompleted) WellnessColors.Slate400 else WellnessColors.Slate900
                                    )
                                    Text(
                                        text = "${task.estimatedDurationMinutes}m • Energy: ${task.minEnergyRequired}/5",
                                        fontSize = 11.sp,
                                        color = WellnessColors.Slate600
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
