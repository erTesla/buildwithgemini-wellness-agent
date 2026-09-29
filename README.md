# Personal Wellness, Performance & Hobby Management Agent

An autonomous web application and AI partner designed to help users record daily mental wellness updates, track personal tasks, discover restorative hobbies, and receive tailored activity suggestions.

Built with Google Material Design principles (clean white background, high-contrast black typography, calm accents), React + TypeScript, Vite, Cloud Firestore, Firebase Hosting, and Vertex AI Gemini 3.6 Flash.

---

## 🌟 Features

1. **Dashboard & Wellness Overview**:
   - Today's self-reported mood badge, energy, stress, sleep, and motivation levels.
   - Quick check-in shortcuts and real-time task completion progress meters.
   - Priority task tracking and personalized activity suggestions.

2. **Daily Wellness Check-in & Journal**:
   - Multi-metric check-ins: Mood, Physical Energy (1-5), Perceived Stress (1-5), Sleep Quality (1-5), and Motivation (1-5).
   - Free-text reflection journal and daily constraint notes.
   - Empathetic, non-judgmental AI summaries without psychological diagnoses or clinical labels.
   - Embedded crisis support protocol offering instant 24/7 hotline numbers (988, 741741, NHS 111, findahelpline.com).

3. **Tasks & Personal Performance**:
   - Create, edit, complete, postpone, and delete personal goals.
   - **Energy-Aware Filtering**: Filter tasks by self-reported energy level (`≤ current energy`) to prevent cognitive overload.
   - Clear distinction between user-created tasks and AI-proposed suggestions.

4. **Hobbies & Creative Interests**:
   - Track existing hobbies, weekly target frequencies, and estimated costs.
   - Pause and resume hobbies without losing historical records.
   - Curated exploration catalog (urban sketching, herb gardening, filter coffee brewing, audiobook nature walking).

5. **Activity Discovery & Place Exploration**:
   - Curated recommendations across cooking, reading, travel, outdoor exploration, and relaxation.
   - Estimated durations, approximate budgets, and practical next steps.
   - Verified location links to Google Maps with disclaimers to check live opening hours.
   - "+ Add as Task" one-click integration.

6. **Insights & Objective Patterns**:
   - Chronological journal timeline.
   - Recorded mood distribution bar charts.
   - Strict adherence to objective logging: no hidden clinical risk scores or speculative inferences.

7. **Profile, Privacy & Settings**:
   - Account identifier switcher with isolated Firestore spaces (`/users/{userId}/*`).
   - Customizable dietary, reading, travel, location, and budget preferences.
   - One-click JSON data export and account erasure for complete GDPR/privacy compliance.

---

## 🚀 Live Deployment

- **Firebase Hosting URL**: [https://qwiklabs-gcp-03-478f309b432f.web.app](https://qwiklabs-gcp-03-478f309b432f.web.app)
- **Firebase Project Console**: `qwiklabs-gcp-03-478f309b432f`
- **Database**: Cloud Firestore Native (`us-central1`)

---

## 📖 Deploying to Your Own Personal Project

Want to host this in your own personal Firebase / Google Cloud account with automated GitHub Actions?
Check out the comprehensive, step-by-step guide:
👉 **[Personal Project Deployment Guide](./PERSONAL_PROJECT_DEPLOYMENT_GUIDE.md)**

It covers:
- Creating a personal Firebase / GCP project from scratch.
- Generating the Firebase Service Account JSON key (with visual examples).
- Setting up GitHub Repository Secrets & Variables for automated CI/CD.
- Direct CLI deployment commands.

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Install & Run Frontend
```bash
cd wellness-app
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run Tests & Typechecks
```bash
cd wellness-app
npm run typecheck
npm run test
npm run build
```

### 3. Deploy to Firebase
```bash
# Build frontend
cd wellness-app
npm run build

# Deploy Hosting and Firestore security rules from repository root
cd ..
npx firebase-tools deploy --only hosting,firestore --project qwiklabs-gcp-03-478f309b432f
```

---

## 🔒 Security & Privacy Architecture

- **User Data Isolation**: Firestore security rules restrict read/write access to matching user document paths.
- **Zero Client Secret Exposure**: Privileged API keys or service credentials are never compiled into frontend bundles.
- **Non-Therapeutic Safety Boundaries**: The assistant explicitly acts as a wellness habits partner, providing crisis hotlines when distress is detected and avoiding medical diagnostic claims.

See [`SECRETS_REPORT.md`](./SECRETS_REPORT.md) for the complete GitHub Actions and Cloud deployment configuration breakdown.
