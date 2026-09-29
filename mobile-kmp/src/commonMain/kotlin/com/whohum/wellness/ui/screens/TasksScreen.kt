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
import com.whohum.wellness.domain.models.TaskItem
import com.whohum.wellness.domain.models.TaskStatus
import com.whohum.wellness.theme.WellnessColors

@Composable
fun TasksScreen(
    tasks: List<TaskItem>,
    onToggleTask: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedFilter by remember { mutableStateOf("all") }

    val filteredTasks = when (selectedFilter) {
        "pending" -> tasks.filter { it.status == TaskStatus.PENDING }
        "completed" -> tasks.filter { it.status == TaskStatus.COMPLETED }
        else -> tasks
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(WellnessColors.Slate50)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Header
        item {
            Column {
                Text(
                    text = "Focus Tasks & Habits",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = WellnessColors.Slate900
                )
                Text(
                    text = "Manage your day with realistic, energy-aware steps.",
                    fontSize = 13.sp,
                    color = WellnessColors.Slate600
                )
            }
        }

        // Filter Pills
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("all" to "All Tasks", "pending" to "To Do", "completed" to "Completed").forEach { (key, label) ->
                    val isSelected = selectedFilter == key
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) WellnessColors.EmeraldLight else Color.White)
                            .border(
                                1.dp,
                                if (isSelected) WellnessColors.EmeraldPrimary else WellnessColors.CardBorder,
                                RoundedCornerShape(12.dp)
                            )
                            .clickable { selectedFilter = key }
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(
                            text = label,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) WellnessColors.EmeraldDark else WellnessColors.Slate800
                        )
                    }
                }
            }
        }

        // Tasks List
        items(filteredTasks) { task ->
            val isDone = task.status == TaskStatus.COMPLETED
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = if (isDone) WellnessColors.Slate100 else Color.White),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(16.dp))
                    .clickable { onToggleTask(task.id) }
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(text = if (isDone) "✅" else "⭕", fontSize = 18.sp)
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = task.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (isDone) WellnessColors.Slate400 else WellnessColors.Slate900
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text(
                                text = "⏱️ ${task.estimatedDurationMinutes}m",
                                fontSize = 11.sp,
                                color = WellnessColors.Slate600
                            )
                            Text(
                                text = "⚡ Energy: ${task.minEnergyRequired}/5",
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
