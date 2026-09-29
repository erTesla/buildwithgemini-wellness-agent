package com.whohum.wellness.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.whohum.wellness.domain.models.CompanionEmotion
import com.whohum.wellness.domain.models.CompanionType

@Composable
fun PixelCompanionCanvas(
    type: CompanionType,
    emotion: CompanionEmotion = CompanionEmotion.IDLE,
    size: Dp = 64.dp,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier.size(size)) {
        val w = this.size.width
        val h = this.size.height
        val pixel = w / 16f

        fun drawPixel(col: Int, row: Int, color: Color) {
            drawRect(
                color = color,
                topLeft = Offset(col * pixel, row * pixel),
                size = Size(pixel, pixel)
            )
        }

        val baseColor = when (type) {
            CompanionType.CAT -> Color(0xFF64748B)
            CompanionType.RACOON -> Color(0xFF854D0E)
            CompanionType.PUPPY -> Color(0xFFEAB308)
            CompanionType.TREX -> Color(0xFF059669)
            CompanionType.CLOUD_POTATO -> Color(0xFFF59E0B)
            CompanionType.CLOUD_BLUEBERRY -> Color(0xFF4F46E5)
        }

        val earColor = when (type) {
            CompanionType.CAT -> Color(0xFF475569)
            CompanionType.RACOON -> Color(0xFF713F12)
            CompanionType.PUPPY -> Color(0xFFCA8A04)
            CompanionType.TREX -> Color(0xFF047857)
            CompanionType.CLOUD_POTATO -> Color(0xFFD97706)
            CompanionType.CLOUD_BLUEBERRY -> Color(0xFF4338CA)
        }

        val cheekColor = Color(0xFFFB7185)
        val eyeColor = Color(0xFF0F172A)
        val white = Color.White

        // 1. Draw Ears / Cloud bumps
        when (type) {
            CompanionType.CAT, CompanionType.RACOON, CompanionType.PUPPY -> {
                // Left ear
                drawPixel(3, 2, earColor)
                drawPixel(4, 2, earColor)
                drawPixel(3, 3, baseColor)
                // Right ear
                drawPixel(11, 2, earColor)
                drawPixel(12, 2, earColor)
                drawPixel(12, 3, baseColor)
            }
            CompanionType.TREX -> {
                // Little Dino Crest
                drawPixel(5, 2, earColor)
                drawPixel(8, 1, earColor)
                drawPixel(10, 2, earColor)
            }
            CompanionType.CLOUD_POTATO, CompanionType.CLOUD_BLUEBERRY -> {
                // Fluffy Cloud top puffs
                for (c in 5..10) drawPixel(c, 2, earColor)
            }
        }

        // 2. Draw Main Head/Body (rows 4 to 12, cols 3 to 12)
        for (r in 4..12) {
            val startCol = if (r == 4 || r == 12) 4 else 2
            val endCol = if (r == 4 || r == 12) 11 else 13
            for (c in startCol..endCol) {
                drawPixel(c, r, baseColor)
            }
        }

        // 3. Cheeks
        drawPixel(3, 9, cheekColor)
        drawPixel(12, 9, cheekColor)

        // 4. Eyes according to emotion
        when (emotion) {
            CompanionEmotion.SMILE -> {
                // Happy squint: ^ ^
                drawPixel(5, 7, eyeColor)
                drawPixel(6, 6, eyeColor)
                drawPixel(7, 7, eyeColor)

                drawPixel(9, 7, eyeColor)
                drawPixel(10, 6, eyeColor)
                drawPixel(11, 7, eyeColor)
            }
            CompanionEmotion.THINKING -> {
                // Eyes looking up and to the right
                drawPixel(6, 6, eyeColor)
                drawPixel(7, 6, eyeColor)
                drawPixel(6, 7, eyeColor)

                drawPixel(10, 6, eyeColor)
                drawPixel(11, 6, eyeColor)
                drawPixel(10, 7, eyeColor)
            }
            CompanionEmotion.SAD -> {
                // Droopy / gentle sympathetic eyes
                drawPixel(5, 7, eyeColor)
                drawPixel(6, 8, eyeColor)
                drawPixel(5, 8, eyeColor)

                drawPixel(10, 8, eyeColor)
                drawPixel(11, 7, eyeColor)
                drawPixel(11, 8, eyeColor)
            }
            CompanionEmotion.IDLE -> {
                // Big peaceful eyes
                drawPixel(5, 7, eyeColor)
                drawPixel(6, 7, eyeColor)
                drawPixel(5, 8, eyeColor)
                drawPixel(6, 8, eyeColor)
                drawPixel(5, 7, white) // glint

                drawPixel(9, 7, eyeColor)
                drawPixel(10, 7, eyeColor)
                drawPixel(9, 8, eyeColor)
                drawPixel(10, 8, eyeColor)
                drawPixel(9, 7, white) // glint
            }
        }

        // 5. Small Cute Mouth
        drawPixel(8, 10, eyeColor)
        if (emotion == CompanionEmotion.SMILE) {
            drawPixel(7, 10, eyeColor)
            drawPixel(9, 10, eyeColor)
        }
    }
}
