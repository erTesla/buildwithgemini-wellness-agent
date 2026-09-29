package com.whohum.wellness.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.whohum.wellness.domain.models.CheckInSource
import com.whohum.wellness.domain.models.MoodLevel
import com.whohum.wellness.domain.models.WellnessCheckIn
import com.whohum.wellness.theme.WellnessColors

@Composable
fun InsightsScreen(
    checkins: List<WellnessCheckIn>,
    modifier: Modifier = Modifier
) {
    var filterSource by remember { mutableStateOf("all") } // "all", "chat", "manual"

    val filteredList = when (filterSource) {
        "chat" -> checkins.filter { it.source == CheckInSource.CHAT }
        "manual" -> checkins.filter { it.source == CheckInSource.MANUAL }
        else -> checkins
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(WellnessColors.Slate50)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Header
        item {
            Column {
                Text(
                    text = "Insights & Pulse",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = WellnessColors.Slate900
                )
                Text(
                    text = "Your weekly rhythm, mood trends, and companion notes.",
                    fontSize = 13.sp,
                    color = WellnessColors.Slate600
                )
            }
        }

        // 2. Weekly Wellness Pulse Hero Card
        item {
            Card(
                shape = RoundedCornerShape(22.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(22.dp))
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(text = "✨", fontSize = 18.sp)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Your Wellness Pulse",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = WellnessColors.Slate900
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "🌱 You have mostly felt calm, steady, and in good spirits this week. Your regular restorative breaks are supporting you well.",
                        fontSize = 13.sp,
                        color = WellnessColors.Slate800,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // 3 Health Pillars
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .background(WellnessColors.Slate50, RoundedCornerShape(12.dp))
                                .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(12.dp))
                                .padding(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = "😊", fontSize = 18.sp)
                            Text(text = "Good", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WellnessColors.Slate900)
                            Text(text = "Top Mood", fontSize = 9.sp, color = WellnessColors.Slate600)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .background(WellnessColors.Slate50, RoundedCornerShape(12.dp))
                                .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(12.dp))
                                .padding(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = "⚡", fontSize = 18.sp)
                            Text(text = "3.8 / 5", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WellnessColors.Slate900)
                            Text(text = "Steady Energy", fontSize = 9.sp, color = WellnessColors.Slate600)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .background(WellnessColors.Slate50, RoundedCornerShape(12.dp))
                                .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(12.dp))
                                .padding(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(text = "🌙", fontSize = 18.sp)
                            Text(text = "4.0 / 5", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = WellnessColors.Slate900)
                            Text(text = "Restful Sleep", fontSize = 9.sp, color = WellnessColors.Slate600)
                        }
                    }
                }
            }
        }

        // 3. Filterable Reflections Timeline
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "Reflections & Journal Timeline",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = WellnessColors.Slate900
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("all" to "All Moments", "chat" to "💬 From Chat", "manual" to "📝 Check-Ins").forEach { (key, label) ->
                        val isSelected = filterSource == key
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) WellnessColors.EmeraldLight else Color.White)
                                .border(
                                    1.dp,
                                    if (isSelected) WellnessColors.EmeraldPrimary else WellnessColors.CardBorder,
                                    RoundedCornerShape(10.dp)
                                )
                                .clickable { filterSource = key }
                                .padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) WellnessColors.EmeraldDark else WellnessColors.Slate800
                            )
                        }
                    }
                }
            }
        }

        // Timeline items
        items(filteredList) { item ->
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(16.dp))
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = item.mood.emoji, fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = item.mood.label,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = WellnessColors.Slate900
                            )
                        }

                        if (item.source == CheckInSource.CHAT) {
                            Box(
                                modifier = Modifier
                                    .background(WellnessColors.EmeraldLight, RoundedCornerShape(8.dp))
                                    .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "💬 Generated from Chat",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = WellnessColors.EmeraldDark
                                )
                            }
                        } else {
                            Box(
                                modifier = Modifier
                                    .background(WellnessColors.Slate100, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "📝 Daily Check-In",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Normal,
                                    color = WellnessColors.Slate600
                                )
                            }
                        }
                    }

                    if (!item.journalText.isNullOrEmpty()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "\"${item.journalText}\"",
                            fontSize = 12.sp,
                            color = WellnessColors.Slate800,
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                        )
                    }

                    if (!item.aiSummary.isNullOrEmpty()) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "💡 Companion Note: ${item.aiSummary}",
                            fontSize = 11.sp,
                            color = WellnessColors.Slate600
                        )
                    }
                }
            }
        }

        // Privacy card
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(WellnessColors.Slate100, RoundedCornerShape(14.dp))
                    .padding(12.dp)
            ) {
                Text(
                    text = "🔒 Private & Personal: These notes reflect your own reflections. Your data is stored on-device and never shared externally.",
                    fontSize = 11.sp,
                    color = WellnessColors.Slate600
                )
            }
        }
    }
}
