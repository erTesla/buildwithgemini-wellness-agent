# WHO-HUM Architecture Guide

This document describes the **Clean Architecture** patterns, structure, and design decisions powering **WHO-HUM** (Personal Wellness, Performance & Hobby Management Agent).

---

## 1. Architectural Philosophy

WHO-HUM follows **Clean Architecture** (concentric layers with unidirectional dependencies flowing inward):

```
       +-------------------------------------------------------+
       |                  Presentation Layer                   |
       |     Screens (Views)  *  Components  *  Hooks (UI)     |
       +---------------------------+---------------------------+
                                   |
                                   v
       +-------------------------------------------------------+
       |               Application / Service Layer             |
       |      wellnessService (Repo)  *  aiService (Gemini)    |
       |           soundEffects (Audio Synthesizer)            |
       +---------------------------+---------------------------+
                                   |
                                   v
       +-------------------------------------------------------+
       |                     Domain Layer                      |
       |       types.ts (Entities)  *  companions.ts           |
       |         Business Rules & Metadata Registry            |
       +---------------------------+---------------------------+
                                   ^
                                   | (implements / consumes)
       +-------------------------------------------------------+
       |             Infrastructure & External APIs            |
       |     Google Cloud Firestore  *  Vertex AI Gemini       |
       |       Firebase Hosting  *  Web Audio / Speech APIs    |
       +-------------------------------------------------------+
```

### Core Principles
1. **Separation of Concerns**: UI screens do not contain direct network or Firestore calls; they call application service abstractions.
2. **Domain-Driven Single Source of Truth**: All data models, types, and companion character profiles live strictly in `src/domain/`.
3. **Offline-First Resilience**: If Firebase credentials are missing or the user goes offline, the app seamlessly falls back to local storage without throwing unhandled exceptions.
4. **Predictable Unidirectional Data Flow**: State lives at the screen or root container level, flows down via props, and updates through explicit async handlers.

---

## 2. Directory Structure

```text
wellness-app/
├── src/
│   ├── domain/               # Core business rules & entities (Zero external dependencies)
│   │   ├── types.ts          # Domain entities: CheckIn, TaskItem, HobbyItem, UserPreferences
│   │   └── companions.ts     # Companion types, emotion definitions, metadata registry
│   │
│   ├── services/             # Application services & data access layer
│   │   ├── wellnessService.ts# Repository pattern: Firestore persistence + LocalStorage fallback
│   │   ├── aiService.ts      # Vertex AI Gemini reasoning, prompts, and distress guardrails
│   │   └── soundEffects.ts   # Web Audio API 8-bit procedural sound synthesizer
│   │
│   ├── hooks/                # Custom reusable React hooks
│   │   └── useVoiceInput.ts  # Web Speech API speech recognition hook
│   │
│   ├── components/           # Reusable presentation components
│   │   ├── PixelCompanion.tsx          # Master companion pixel-art canvas (SVG crisp-edges)
│   │   ├── CompanionOnboardingModal.tsx# 1-time companion selection modal
│   │   ├── AmbientCompanionWidget.tsx  # Floating companion widget (Desktop only)
│   │   ├── MobileBottomNav.tsx         # Thumb-friendly bottom navigation (Mobile only)
│   │   ├── Navbar.tsx                  # Top navigation & system mode toggle
│   │   └── PixelLoadingScreen.tsx      # Ambient retro loading screen
│   │
│   ├── screens/              # Top-level view containers
│   │   ├── SimpleChatScreen.tsx        # Minimal, distraction-free conversational buddy
│   │   ├── DashboardScreen.tsx         # Health telemetry & circadian rhythm strip
│   │   ├── CheckinScreen.tsx           # Multi-dimensional wellness check-in form
│   │   ├── TasksScreen.tsx             # Energy-matched task manager
│   │   ├── HobbiesScreen.tsx           # Weekly hobbies & burnout prevention
│   │   ├── DiscoverScreen.tsx          # Local outings & culinary recommendations
│   │   ├── HistoryScreen.tsx           # Trend lines & weekly telemetry charts
│   │   ├── ProfileScreen.tsx           # Companion picker & data portability
│   │   └── AssistantScreen.tsx         # Deep reasoning AI assistant dashboard
│   │
│   ├── test/                 # Automated test suite (Vitest + Testing Library)
│   │   ├── domain.test.ts              # Unit tests for domain registry & rules
│   │   ├── companion.test.tsx          # Unit tests for companions & modal
│   │   ├── uiFeatures.test.tsx         # Unit tests for speech, audio & sound
│   │   ├── buddy.test.ts               # Unit tests for circadian calculations
│   │   └── wellness.test.ts            # Unit tests for local storage repository
│   │
│   ├── App.tsx               # Root container & top-level routing
│   └── main.tsx              # Application entry point
```

---

## 3. Companion Character Registry Pattern

Companions are designed to be completely modular and extensible.

All 6 companions are registered in `src/domain/companions.ts`:
- 🐱 **Cat**: Quiet & Observant
- 🦝 **Racoon Dog**: Curious & Thoughtful
- 🐶 **Dog / Puppy**: Loyal & Cheerful
- 🦖 **T-Rex**: Tiny Arms, Big Heart
- 🥔 **Cloud Potato**: Warm & Fluffy Comfort
- 🫐 **Cloud Blueberry**: Sweet, Calming Berry Puff

### How to Add a New Companion
To add a new companion (e.g. `cosmic_bunny`), follow these 3 steps:

1. **Register in Domain (`src/domain/companions.ts`)**:
   Add the type identifier and profile:
   ```typescript
   export type CompanionType = ... | 'cosmic_bunny';

   COMPANION_REGISTRY.cosmic_bunny = {
     id: 'cosmic_bunny',
     name: 'Cosmic Bunny',
     emoji: '🐰',
     tagline: 'Stars & Softness',
     description: 'A glowing celestial bunny that brings peace and quiet focus.',
     accentBg: '#e0e7ff',
     colorName: 'Cosmic Lavender'
   };
   ```

2. **Add SVG Art in `src/components/PixelCompanion.tsx`**:
   Add a `<g id="bunny-base">` block inside the SVG using 24x24 pixel coordinates.

3. **Verify with Tests**:
   Run `npm test` to verify automatic onboarding modal inclusion and rendering.

---

## 4. Responsive Device Separation

To maintain clean ergonomics across both smartphones and large desktop monitors:

| Feature | Small Screen (`< 768px`) | Tablet / Desktop (`>= 768px`) |
| :--- | :--- | :--- |
| **Navigation** | `MobileBottomNav` (fixed bottom, thumb-accessible) | `Navbar` top navigation tabs |
| **Floating Companion** | **Hidden** (`hidden md:flex`) — zero input overlap | **Visible** bottom-right dock |
| **Footers** | **Hidden** (`hidden md:block`) — preserves chat height | **Visible** standard footer |
| **Companion Onboarding** | One-time pop-over modal | One-time pop-over modal |
| **Companion Switching** | Settings / Profile (`ProfileScreen`) | Settings / Profile (`ProfileScreen`) |

---

## 5. Offline-First Repository Pattern

The `wellnessService.ts` implements repository fallback logic:
1. Every write operation (`saveCheckIn`, `saveTask`, `saveHobby`, `saveUserPreferences`) commits to **Google Cloud Firestore**.
2. If Firestore is unreachable (network drop, missing API keys, or permission issues), the operation saves to the browser's persistent `localStorage` cache.
3. Every read operation queries Firestore first, then falls back to local cache if no documents are retrieved.
4. Users have **100% data ownership**:
   - `exportAllUserData()`: Downloads all check-ins, tasks, and preferences as formatted JSON.
   - `clearAllUserData()`: Instantly erases all records.

---

## 6. Build and Verification Commands

```bash
# Type-check TypeScript across the entire project
npm run typecheck

# Run automated unit tests
npm test

# Build production bundle
npm run build

# Deploy to Firebase Hosting
npx firebase-tools deploy --only hosting
```
