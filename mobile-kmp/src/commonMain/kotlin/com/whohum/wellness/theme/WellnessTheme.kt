package com.whohum.wellness.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

object WellnessColors {
    val EmeraldPrimary = Color(0xFF059669)
    val EmeraldLight = Color(0xFFECFDF5)
    val EmeraldDark = Color(0xFF065F46)
    val TealAccent = Color(0xFF0D9488)
    
    val Slate50 = Color(0xFFF8FAFC)
    val Slate100 = Color(0xFFF1F5F9)
    val Slate200 = Color(0xFFE2E8F0)
    val Slate400 = Color(0xFF94A3B8)
    val Slate600 = Color(0xFF475569)
    val Slate800 = Color(0xFF1E293B)
    val Slate900 = Color(0xFF0F172A)
    
    val AmberWarm = Color(0xFFF59E0B)
    val RoseSoft = Color(0xFFF43F5E)
    val CardBorder = Color(0xFFE2E8F0)
}

val WellnessShapes = Shapes(
    small = RoundedCornerShape(10.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(32.dp)
)

@Composable
fun WellnessTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = lightColorScheme(
        primary = WellnessColors.EmeraldPrimary,
        onPrimary = Color.White,
        primaryContainer = WellnessColors.EmeraldLight,
        onPrimaryContainer = WellnessColors.EmeraldDark,
        secondary = WellnessColors.TealAccent,
        background = WellnessColors.Slate50,
        surface = Color.White,
        onBackground = WellnessColors.Slate900,
        onSurface = WellnessColors.Slate900,
        outline = WellnessColors.CardBorder
    )

    MaterialTheme(
        colorScheme = colorScheme,
        shapes = WellnessShapes,
        content = content
    )
}
