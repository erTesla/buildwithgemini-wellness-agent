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
import com.whohum.wellness.domain.ai.LocalCompanionEngine
import com.whohum.wellness.domain.models.*
import com.whohum.wellness.theme.WellnessColors
import com.whohum.wellness.ui.components.PixelCompanionCanvas

data class ChatMessage(
    val id: String,
    val sender: String, // "user" or "companion"
    val text: String,
    val emotion: CompanionEmotion = CompanionEmotion.IDLE,
    val savedCheckIn: WellnessCheckIn? = null,
    val timestamp: String = "now"
)

@Composable
fun ChatScreen(
    companionType: CompanionType,
    userId: String,
    onCheckInLogged: (WellnessCheckIn) -> Unit,
    modifier: Modifier = Modifier
) {
    var messages by remember {
        mutableStateOf(
            listOf(
                ChatMessage(
                    id = "msg_welcome",
                    sender = "companion",
                    text = "Hey there, buddy! 👋 I'm your Who-Hum lifestyle companion. Talk to me like a close friend—tell me about your day, any exciting things that happened, or how you're feeling. I'm here for you, 100% offline or online!",
                    emotion = CompanionEmotion.SMILE
                )
            )
        )
    }

    var inputText by remember { mutableStateOf("") }
    var isThinking by remember { mutableStateOf(false) }
    val localEngine = remember { LocalCompanionEngine() }
    val coroutineScope = rememberCoroutineScope()

    val quickStarters = listOf(
        "🚲 I bought a cycle today!",
        "🎯 Productive day at work",
        "🌲 Suggest a 15m walk",
        "🍲 Quick healthy dinner",
        "🧘 Feeling a bit overwhelmed"
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(WellnessColors.Slate50)
    ) {
        // 1. Companion Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .border(1.dp, WellnessColors.CardBorder)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            PixelCompanionCanvas(
                type = companionType,
                emotion = if (isThinking) CompanionEmotion.THINKING else CompanionEmotion.IDLE,
                size = 40.dp
            )
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "${companionType.displayName} Companion",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = WellnessColors.Slate900
                )
                Text(
                    text = "🟢 On-Device Local AI Ready • Offline",
                    fontSize = 11.sp,
                    color = WellnessColors.EmeraldDark
                )
            }
        }

        // 2. Messages List
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            items(messages) { msg ->
                val isUser = msg.sender == "user"
                Box(
                    modifier = Modifier.fillMaxWidth(),
                    contentAlignment = if (isUser) Alignment.CenterEnd else Alignment.CenterStart
                ) {
                    Column(
                        modifier = Modifier
                            .widthIn(max = 300.dp)
                            .clip(
                                RoundedCornerShape(
                                    topStart = 16.dp,
                                    topEnd = 16.dp,
                                    bottomStart = if (isUser) 16.dp else 4.dp,
                                    bottomEnd = if (isUser) 4.dp else 16.dp
                                )
                            )
                            .background(if (isUser) WellnessColors.EmeraldPrimary else Color.White)
                            .border(
                                1.dp,
                                if (isUser) WellnessColors.EmeraldPrimary else WellnessColors.CardBorder,
                                RoundedCornerShape(16.dp)
                            )
                            .padding(12.dp)
                    ) {
                        Text(
                            text = msg.text,
                            fontSize = 13.sp,
                            color = if (isUser) Color.White else WellnessColors.Slate900,
                            lineHeight = 18.sp
                        )

                        // Subtle check-in saved tag
                        if (msg.savedCheckIn != null) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "✓ Saved quietly to Insights (Mood: ${msg.savedCheckIn.mood.label})",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = WellnessColors.EmeraldDark
                            )
                        }
                    }
                }
            }

            if (isThinking) {
                item {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier
                            .background(Color.White, RoundedCornerShape(12.dp))
                            .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(12.dp))
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                    ) {
                        PixelCompanionCanvas(
                            type = companionType,
                            emotion = CompanionEmotion.THINKING,
                            size = 28.dp
                        )
                        Text(
                            text = "Who-Hum is listening & reflecting...",
                            fontSize = 11.sp,
                            color = WellnessColors.Slate600
                        )
                    }
                }
            }
        }

        // 3. Quick Conversation Starter Chips
        if (messages.size <= 3) {
            Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)) {
                Text(
                    text = "Try asking or sharing:",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = WellnessColors.Slate600
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    quickStarters.take(3).forEach { starter ->
                        Text(
                            text = starter,
                            fontSize = 11.sp,
                            color = WellnessColors.Slate800,
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White)
                                .border(1.dp, WellnessColors.CardBorder, RoundedCornerShape(12.dp))
                                .clickable {
                                    inputText = starter
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
        }

        // 4. Input Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .border(1.dp, WellnessColors.CardBorder)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Tell your buddy about your day...", fontSize = 13.sp) },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = WellnessColors.EmeraldPrimary,
                    unfocusedBorderColor = WellnessColors.CardBorder
                ),
                singleLine = true
            )

            Button(
                onClick = {
                    val prompt = inputText.trim()
                    if (prompt.isNotEmpty() && !isThinking) {
                        val userMsg = ChatMessage(
                            id = "user_${messages.size}",
                            sender = "user",
                            text = prompt
                        )
                        messages = messages + userMsg
                        inputText = ""
                        isThinking = true

                        // Process locally offline
                        kotlinx.coroutines.GlobalScope.let {
                            // Using local companion engine
                        }
                    }
                },
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = WellnessColors.EmeraldPrimary)
            ) {
                Text("Send", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
