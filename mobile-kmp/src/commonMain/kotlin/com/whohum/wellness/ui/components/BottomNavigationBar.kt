package com.whohum.wellness.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.whohum.wellness.theme.WellnessColors

enum class MobileTab(val label: String, val iconEmoji: String) {
    TODAY("Today", "🏠"),
    CHAT("Chat", "💬"),
    TASKS("Tasks", "✅"),
    ACTIVITIES("Activities", "✨"),
    INSIGHTS("Insights", "📊")
}

@Composable
fun BottomNavigationBar(
    currentTab: MobileTab,
    onTabSelected: (MobileTab) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(Color.White)
            .padding(horizontal = 8.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceAround,
        verticalAlignment = Alignment.CenterVertically
    ) {
        MobileTab.entries.forEach { tab ->
            val isSelected = currentTab == tab

            Column(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .clickable { onTabSelected(tab) }
                    .background(if (isSelected) WellnessColors.EmeraldLight else Color.Transparent)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = tab.iconEmoji,
                    fontSize = 18.sp
                )
                Text(
                    text = tab.label,
                    fontSize = 11.sp,
                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                    color = if (isSelected) WellnessColors.EmeraldDark else WellnessColors.Slate600
                )
            }
        }
    }
}
