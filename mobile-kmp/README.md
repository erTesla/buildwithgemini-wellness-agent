# Who-Hum Wellness Companion (Kotlin Multiplatform Mobile App)

Production-ready **Kotlin Multiplatform (KMP) & Compose Multiplatform** application for **Android** and **iOS**, featuring 100% native UI, offline-first local AI companion architecture, and scheduled 4x daily mental health check-ins before bedtime.

---

## Key Mobile Features

1. **Native Compose Multiplatform UI**:
   - Built on a soothing wellness design system (`WellnessTheme`) with soft emeralds, teals, slates, and curved surfaces.
   - Native Canvas-rendered **Pixel Art Companions** (`Cat`, `Racoon Dog`, `Dog`, `T-Rex`, `Cloud Potato`, `Cloud Blueberry`) with animated expressions (*idle*, *thinking*, *smile*, *sad*).
2. **Offline-Ready Local AI Engine (`LocalAiEngine`)**:
   - Pluggable `LocalModelRunner` interface ready for on-device inference (e.g. Gemini Nano / Google AI Edge, MediaPipe LLM Inference, llama.cpp, or ONNX Runtime).
   - Operates 100% offline without network connectivity, analyzing conversation and extracting silent check-in telemetry into the local wellness journal.
3. **4x Daily Timely Mental Health Notification Scheduler**:
   - Schedules 4 timely touchpoints evenly spaced between morning wake-up and bedtime:
     - **08:30 Morning Intention**: Sleep check and daily intention.
     - **13:00 Midday Reset**: Afternoon pause and energy calibration.
     - **18:00 Evening Recharge**: Transition from work to restorative hobbies.
     - **21:30 Bedtime Reflection**: Unloading thoughts with companion for deep, restful sleep.
   - **Android**: Uses `AlarmManager.setExactAndAllowWhileIdle()` to guarantee delivery even in Doze/standby.
   - **iOS**: Uses `UNUserNotificationCenter` repeating calendar triggers.

---

## Project Structure

```
mobile-kmp/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle/
│   └── libs.versions.toml
└── src/
    ├── commonMain/kotlin/com/whohum/wellness/
    │   ├── App.kt                          # Main Compose Scaffold & Tab Router
    │   ├── domain/
    │   │   ├── models/                     # MoodLevel, CheckIn, Task, Hobby, Companion
    │   │   ├── ai/LocalAiEngine.kt         # Offline AI engine & pluggable local model runner
    │   │   └── notifications/              # 4x Daily reminder calculation & interface
    │   ├── theme/WellnessTheme.kt          # Material 3 wellness theme
    │   └── ui/
    │       ├── components/                 # Pixel companion canvas, navigation bar
    │       └── screens/                    # Today, Chat, Tasks, Activities, Insights
    ├── androidMain/
    │   ├── AndroidManifest.xml             # Permissions (POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM)
    │   └── kotlin/com/whohum/wellness/
    │       ├── MainActivity.kt             # ComponentActivity host
    │       └── notifications/              # Android AlarmManager & BroadcastReceiver
    └── iosMain/
        └── kotlin/com/whohum/wellness/
            ├── MainViewController.kt       # ComposeUIViewController for SwiftUI
            └── notifications/              # iOS UNUserNotificationCenter scheduler
```

---

## How to Build and Run

### Android
1. Open Android Studio (Ladybug / Koala or newer).
2. Open the `mobile-kmp` directory.
3. Let Gradle sync dependencies.
4. Select an Android emulator (API 26+) or physical device.
5. Click **Run** (`Shift + F10`).

### iOS
1. Open the project in Android Studio or JetBrains Fleet.
2. Ensure Xcode 15+ and CocoaPods / Swift Package Manager are configured.
3. Run the iOS target simulator (e.g. `iosArm64` / `iosSimulatorArm64`).
4. Or embed `ComposeApp.framework` directly into an existing Xcode SwiftUI `ContentView`:
   ```swift
   import SwiftUI
   import ComposeApp

   struct ContentView: UIViewControllerRepresentable {
       func makeUIViewController(context: Context) -> UIViewController {
           MainViewControllerKt.MainViewController()
       }
       func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
   }
   ```

---

## Adding On-Device Local Offline AI (Gemini Nano)
Implement `LocalModelRunner` with Google AI Edge / MediaPipe GenAI:
```kotlin
class GeminiNanoRunner(context: Context) : LocalModelRunner {
    override suspend fun generateResponse(prompt: String, systemInstruction: String): String {
        // Run on-device inference via MediaPipe or AICore
        return inferenceModel.generate(prompt)
    }
    override fun isModelLoaded(): Boolean = true
}
```
Inject this into `LocalCompanionEngine(localModelRunner = GeminiNanoRunner(context))` to enable zero-latency, private, offline intelligence.
