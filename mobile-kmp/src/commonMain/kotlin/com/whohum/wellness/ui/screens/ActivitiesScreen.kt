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
import com.whohum.wellness.domain.models.HobbyItem
import com.whohum.wellness.domain.models.HobbyStatus
import com.whohum.wellness.theme.WellnessColors

data class CuratedOuting(
    val id: String,
    val title: String,
    val category: String,
    val durationMinutes: Int,
    val description: String,
    val emoji: String
)

@Composable
fun ActivitiesScreen(
    hobbies: List<HobbyItem>,
    onAddAsTask: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var activeSubTab by remember { mutableStateOf("hobbies") } // "hobbies" or "explore"

    val curatedList = remember {
        listOf(
            CuratedOuting("rec_1", "Peaceful Botanic Garden Walk", "nature", 30, "Lush trails, shady benches, and crisp clean air.", "🌲"),
            CuratedOuting("rec_2", "Warm Olive Oil & Chickpea Bowl", "cooking", 20, "Grounding Mediterranean recipe rich in omega-3.", "🍲"),
            CuratedOuting("rec_3", "20-Minute Cozy Reading Ritual", "reading", 20, "Escape into inspiring literature without phone screens.", "📖"),
            CuratedOuting("rec_4", "Watercolor Sunset Sketch", "arts", 25, "Relaxing freeform painting to soothe overactive thoughts.", "🎨")
        )
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(WellnessColors.Slate50)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Header
        item {
            Column {
                Text(
                    text = "Activities & Rest Hub",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = WellnessColors.Slate900
                )
                Text(
                    text = "Balancing demanding work with restorative hobbies & outings.",
                    fontSize = 13.sp,
                    color = WellnessColors.Slate600
                )
            }
        }

        // Sub-tabs
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(WellnessColors.Slate100, RoundedCornerShape(12.dp))
                    .padding(4.dp)
            ) {
                listOf("hobbies" to "My Hobbies & Habits", "explore" to "Explore Ideas & Outings").forEach { (tabId, label) ->
                    val isSelected = activeSubTab == tabId
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) Color.White else Color.Transparent)
                            .clickable { activeSubTab = tabId }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = label,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) WellnessColors.EmeraldDark else WellnessColors.Slate600
                        )
                    }
                }
            }
        }

        if (activeSubTab == "hobbies") {
            items(hobbies) { hobby ->
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(18.dp))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = hobby.name,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = WellnessColors.Slate900
                            )
                            Box(
                                modifier = Modifier
                                    .background(WellnessColors.EmeraldLight, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = if (hobby.status == HobbyStatus.ACTIVE) "Active" else "Paused",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = WellnessColors.EmeraldDark
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Target: ${hobby.frequencyPerWeek}x / week • Streak: ${hobby.streakWeeks} weeks in motion 🔥",
                            fontSize = 12.sp,
                            color = WellnessColors.Slate600
                        )
                    }
                }
            }
        } else {
            items(curatedList) { outing ->
                Card(
                    shape = RoundedCornerShape(18.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(18.dp))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(text = outing.emoji, fontSize = 22.sp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = outing.title,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = WellnessColors.Slate900
                                )
                                Text(
                                    text = "${outing.durationMinutes} min • ${outing.category.replaceFirstChar { it.uppercase() }}",
                                    fontSize = 11.sp,
                                    color = WellnessColors.EmeraldDark
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = outing.description,
                            fontSize = 12.sp,
                            color = WellnessColors.Slate600,
                            lineHeight = 16.sp
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Button(
                            onClick = { onAddAsTask(outing.title) },
                            shape = RoundedCornerShape(10.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = WellnessColors.EmeraldPrimary),
                            modifier = Modifier.height(34.dp)
                        ) {
                            Text("+ Add to Today's Tasks", fontSize = 11.sp)
                        }
                    }
                }
            }
        }
    }
}
