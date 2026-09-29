# Required GitHub Secrets & Configuration Report

This document specifies all configuration items, secrets, and environment variables derived directly from the application's implementation, Cloud Functions, and GitHub Actions CI/CD workflows (`ci.yml` and `deploy.yml`).

---

## 1. GitHub Actions Secrets (Encrypted Repository Secrets)

These values are sensitive credentials and must be added under **GitHub Repository > Settings > Secrets and variables > Actions > New repository secret**.

| Secret Name | Mandatory? | Purpose | Where to Obtain | Consuming Workflow / Service | Lifecycle |
|---|---|---|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | **Mandatory** for automatic CI/CD deployment | Grants GitHub Actions runner permissions to deploy files to Firebase Hosting and release Firestore rules. | Firebase Console > Project Settings > Service accounts > "Generate new private key", or via GCP IAM (`firebase-adminsdk` role). Paste raw JSON. | `.github/workflows/deploy.yml` (`FirebaseExtended/action-hosting-deploy`) | Deploy-time |
| `FIREBASE_API_KEY` | Optional in CI (has public fallback) | Web API key used by Firebase client SDK to connect to Firestore and services. | Firebase Console > Project Settings > General > Web Apps config (`apiKey`). | `.github/workflows/deploy.yml` (Injected during `npm run build`) | Build-time |
| `GEMINI_API_KEY` | Optional (Vertex AI uses IAM credentials by default) | Server-side Gemini API key if deploying functions outside Google Cloud or using Google AI Studio. | Google AI Studio (`aistudio.google.com/apikey`). | Firebase Cloud Functions environment | Runtime |

---

## 2. GitHub Actions Repository Variables (Non-Secret)

These values are public configurations and can be added under **GitHub Repository > Settings > Secrets and variables > Actions > Variables**.

| Variable Name | Mandatory? | Purpose | Recommended Default Value | Consuming Workflow |
|---|---|---|---|---|
| `FIREBASE_PROJECT_ID` | Recommended | Specifies target Firebase / GCP Project ID. | `qwiklabs-gcp-03-478f309b432f` | `.github/workflows/deploy.yml` |
| `FIREBASE_APP_ID` | Recommended | Identifies the registered Firebase Web Application. | `1:20299313946:web:f98ada42304d61da44f2a3` | `.github/workflows/deploy.yml` |
| `FIREBASE_AUTH_DOMAIN` | Optional | Auth callback domain for OAuth and authentication. | `qwiklabs-gcp-03-478f309b432f.firebaseapp.com` | `.github/workflows/deploy.yml` |

---

## 3. Firebase Server-Side Secrets & IAM Roles

Configured on the GCP / Firebase Project:

1. **Vertex AI Service Agent**:
   - The default compute/cloud functions service account (`antigravity-sa@...` or `...-compute@developer.gserviceaccount.com`) must have the IAM role **`roles/aiplatform.user`** (Vertex AI User).
   - This authorizes calls to `gemini-3.6-flash` via Vertex AI Application Default Credentials without embedding static API keys.

---

## 4. Public Frontend Client Configuration

These items are bundled into the browser JavaScript assets (prefixed with `VITE_`):

| Variable Name | Sensitivity | Description |
|---|---|---|
| `VITE_FIREBASE_PROJECT_ID` | Public | Firebase project identifier |
| `VITE_FIREBASE_APP_ID` | Public | Firebase client app registration ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Public | Default storage bucket URL |
| `VITE_FIREBASE_API_KEY` | Public client token | Standard Firebase browser Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Public | Auth handler domain |
| `VITE_AI_FUNCTIONS_URL` | Public endpoint | URL to Cloud Function endpoint for server-side AI evaluation |

---

## 5. Security & Verification Summary

- **No Server Secrets in Client Code**: All Vertex AI service credentials and privileged keys remain strictly on the backend.
- **Isolated User Storage**: Firestore rules enforce user-level document partitioning (`/users/{userId}/*`).
- **Safety Fallback**: If external network endpoints are unavailable, the client seamlessly falls back to a deterministic local rules and safety engine.
