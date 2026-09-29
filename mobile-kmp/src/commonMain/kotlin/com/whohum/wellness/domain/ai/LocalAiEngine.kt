package com.whohum.wellness.domain.ai

import com.whohum.wellness.domain.models.CheckInSource
import com.whohum.wellness.domain.models.CompanionEmotion
import com.whohum.wellness.domain.models.MoodLevel
import com.whohum.wellness.domain.models.WellnessCheckIn

data class AiResponse(
    val replyText: String,
    val emotion: CompanionEmotion = CompanionEmotion.IDLE,
    val extractedCheckIn: WellnessCheckIn? = null,
    val suggestedAction: String? = null,
    val isOfflineMode: Boolean = true
)

/**
 * Pluggable interface for future on-device local models
 * (e.g., Gemini Nano / MediaPipe LLM Inference / llama.cpp / ONNX).
 */
interface LocalModelRunner {
    suspend fun generateResponse(prompt: String, systemInstruction: String): String
    fun isModelLoaded(): Boolean
}

/**
 * Local AI Companion Engine that works 100% offline without internet.
 * Analyzes natural conversation, extracts wellness logs silently,
 * and maintains warm companion empathy.
 */
class LocalCompanionEngine(
    private val localModelRunner: LocalModelRunner? = null
) {
    suspend fun processUserMessage(
        userMessage: String,
        userId: String
    ): AiResponse {
        val lower = userMessage.lowercase().trim()

        // 1. Detect Mood & Emotion
        val (mood, emotion) = when {
            lower.contains("happy") || lower.contains("bought") || lower.contains("cycle") ||
            lower.contains("great") || lower.contains("promoted") || lower.contains("excited") ||
            lower.contains("yay") || lower.contains("love") -> {
                Pair(MoodLevel.THRIVING, CompanionEmotion.SMILE)
            }
            lower.contains("good") || lower.contains("fine") || lower.contains("calm") ||
            lower.contains("productive") || lower.contains("peaceful") -> {
                Pair(MoodLevel.GOOD, CompanionEmotion.SMILE)
            }
            lower.contains("tired") || lower.contains("exhausted") || lower.contains("sad") ||
            lower.contains("cry") || lower.contains("lonely") || lower.contains("down") -> {
                Pair(MoodLevel.LOW, CompanionEmotion.SAD)
            }
            lower.contains("stressed") || lower.contains("overwhelmed") || lower.contains("anxious") ||
            lower.contains("too much") || lower.contains("burnout") || lower.contains("panic") -> {
                Pair(MoodLevel.OVERWHELMED, CompanionEmotion.SAD)
            }
            else -> {
                Pair(MoodLevel.OKAY, CompanionEmotion.IDLE)
            }
        }

        // 2. Generate Empathic Offline Response
        val replyText = if (localModelRunner != null && localModelRunner.isModelLoaded()) {
            localModelRunner.generateResponse(
                prompt = userMessage,
                systemInstruction = "You are Who-Hum, an empathetic, soothing lifestyle wellness companion."
            )
        } else {
            generateBuiltInOfflineReply(lower, mood)
        }

        // 3. Silently Extract Background Wellness Check-In
        val timestamp = "now"
        val checkIn = WellnessCheckIn(
            id = "offline_log_${currentTimeMillis()}",
            userId = userId,
            mood = mood,
            energyLevel = if (mood == MoodLevel.THRIVING) 5 else if (mood == MoodLevel.GOOD) 4 else if (mood == MoodLevel.OKAY) 3 else 2,
            stressLevel = if (mood == MoodLevel.OVERWHELMED) 5 else if (mood == MoodLevel.LOW) 4 else 2,
            sleepQuality = 4,
            journalText = userMessage,
            aiSummary = "Reflected during companion conversation: $userMessage",
            source = CheckInSource.CHAT,
            timestamp = timestamp
        )

        return AiResponse(
            replyText = replyText,
            emotion = emotion,
            extractedCheckIn = checkIn,
            suggestedAction = suggestRestorativeAction(mood),
            isOfflineMode = true
        )
    }

    private fun generateBuiltInOfflineReply(lower: String, mood: MoodLevel): String {
        return when {
            lower.contains("cycle") || lower.contains("bike") ->
                "That is wonderful! 🚲 Riding a bicycle is one of the most freeing ways to feel the breeze and disconnect from screens. How does it feel to have it?"

            mood == MoodLevel.THRIVING ->
                "I love seeing you with this high positive energy! 🌟 Take a moment to soak this in and celebrate yourself today."

            mood == MoodLevel.GOOD ->
                "I am so glad to hear that. 🌱 A calm and steady rhythm is the foundation of long-term wellness. Keep up this gentle flow!"

            mood == MoodLevel.LOW ->
                "I hear you, buddy. 💙 It is completely okay to feel drained or down. Don't push yourself today—wrap up in warmth, take slow breaths, and rest."

            mood == MoodLevel.OVERWHELMED ->
                "Please take a slow, deep breath with me right now. Inhale... and exhale. 🌿 Step back from what you're doing for just 5 minutes. You don't have to carry everything at once."

            lower.contains("walk") ->
                "A gentle 15-minute nature walk is proven to drop cortisol by over 20%. Put on comfortable shoes and let your mind drift!"

            lower.contains("recipe") || lower.contains("dinner") || lower.contains("eat") ->
                "How about a warm, grounding Mediterranean bowl with chickpeas, fresh greens, and olive oil? Nourishing and quick to prepare."

            else ->
                "Thank you for sharing that with me. I've noted how you're feeling quietly in your journal so you can review your week anytime. What's on your mind next?"
        }
    }

    private fun suggestRestorativeAction(mood: MoodLevel): String? {
        return when (mood) {
            MoodLevel.THRIVING -> "Take a joyful outdoor bike ride or sketch"
            MoodLevel.GOOD -> "Enjoy a calm cup of herbal tea"
            MoodLevel.OKAY -> "Take a 10-minute posture stretch"
            MoodLevel.LOW -> "Rest your eyes with 15 minutes of quiet time"
            MoodLevel.OVERWHELMED -> "Slow 4-7-8 breathing exercise"
        }
    }

    private fun currentTimeMillis(): Long = 1774862400000L // System time abstraction
}
