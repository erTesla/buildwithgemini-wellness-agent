# 🚀 How to Deploy Who-Hum to Your Personal Google Cloud & Firebase Project

This step-by-step guide walks you through deploying **Who-Hum • For Humans** into your **own personal Google Cloud / Firebase account** from scratch. 

It covers:
1. Setting up your personal Google Cloud & Firebase project.
2. Generating and locating the necessary keys and credentials.
3. What the secret keys look like (with real examples).
4. Setting up GitHub Secrets for automatic GitHub Actions deployment.
5. Deploying manually from your local terminal.

---

## 📋 Table of Contents
- [Step 1: Create a Personal Firebase / Google Cloud Project](#step-1-create-a-personal-firebase--google-cloud-project)
- [Step 2: Enable Cloud Firestore & Vertex AI](#step-2-enable-cloud-firestore--vertex-ai)
- [Step 3: Register a Web App & Get Web API Keys](#step-3-register-a-web-app--get-web-api-keys)
- [Step 4: Generate the Firebase Service Account Key (JSON)](#step-4-generate-the-firebase-service-account-key-json)
- [Step 5: Exactly What the Credentials Look Like](#step-5-exactly-what-the-credentials-look-like)
- [Step 6: Configure GitHub Secrets & Variables for CI/CD](#step-6-configure-github-secrets--variables-for-cicd)
- [Step 7: Deploying the Application](#step-7-deploying-the-application)
  - [Method A: Automatic Deployment via GitHub Actions (Recommended)](#method-a-automatic-deployment-via-github-actions-recommended)
  - [Method B: Direct Deployment from Your Local Terminal](#method-b-direct-deployment-from-your-local-terminal)
- [Troubleshooting & Common Questions](#troubleshooting--common-questions)

---

## Step 1: Create a Personal Firebase / Google Cloud Project

1. Go to the **[Firebase Console](https://console.firebase.google.com/)**.
2. Sign in with your personal Google account.
3. Click **Add project** (or **Create a project**).
4. Enter a name for your project (e.g., `my-whohum-buddy`).
5. Choose whether to enable Google Analytics (optional, can be disabled).
6. Click **Create Project** and wait for provisioning to complete.

> [!NOTE]
> Every Firebase project is automatically a Google Cloud project with the exact same Project ID (e.g., `my-whohum-buddy-12345`).

---

## Step 2: Enable Cloud Firestore & Vertex AI

### 2.1 Enable Cloud Firestore (Database)
1. In the left navigation menu of the Firebase Console, go to **Build** > **Firestore Database**.
2. Click **Create database**.
3. Select your location (e.g. `nam5 (us-central)` or closest region to you).
4. For security rules, select **Start in production mode** (our repository includes predefined security rules in `firestore.rules`).
5. Click **Create**.

### 2.2 Enable Vertex AI (Gemini 3.6 Flash / AI Companion)
1. Open the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. In the top project selector dropdown, select your newly created project.
3. In the search bar at the top, type `Vertex AI API` and select it.
4. Click **Enable**.
5. *(Optional)* If using Google AI Studio API key instead of Vertex AI, visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey) to generate a free Gemini API key.

---

## Step 3: Register a Web App & Get Web API Keys

1. In the Firebase Console, click the **⚙️ Project Settings** (gear icon next to Project Overview in top-left).
2. Scroll down to the **Your apps** card at the bottom.
3. Click the **Web icon** (`</>`) to add a web application.
4. App nickname: `who-hum-web`.
5. Check the box **"Also set up Firebase Hosting for this app"**.
6. Click **Register app**.
7. Firebase will display your `firebaseConfig` object on the screen. Keep this tab open or copy it down!

---

## Step 4: Generate the Firebase Service Account Key (JSON)

This service account key allows GitHub Actions to deploy your code to Firebase Hosting without human interaction.

1. In the Firebase Console, stay in **Project Settings** (gear icon ⚙️).
2. Click on the **Service accounts** tab at the top.
3. Ensure **Firebase Admin SDK** is selected.
4. Click the button that says **"Generate new private key"**.
5. A confirmation dialog will pop up warning you to keep it confidential. Click **Generate key**.
6. A `.json` file will automatically download to your computer (e.g., `my-whohum-buddy-firebase-adminsdk-xxxxx.json`).

> [!IMPORTANT]
> Keep this file private. Never commit it to git or push it publicly to GitHub. You will paste its contents directly into GitHub Encrypted Secrets in Step 6.

---

## Step 5: Exactly What the Credentials Look Like

To avoid confusion, here is what each key looks like:

### 1. The Firebase Service Account Key (`FIREBASE_SERVICE_ACCOUNT`)
This is the `.json` file you downloaded in Step 4. When you open it in a text editor (Notepad, VS Code, etc.), it looks like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id-here",
  "private_key_id": "example_key_id_40_characters_hex",
  "private_key": "-----BEGIN [PRIVATE_KEY_WILL_BE_HERE]-----\n[YOUR_LONG_ENCRYPTED_RSA_PRIVATE_KEY_STRING]\n-----END [PRIVATE_KEY_WILL_BE_HERE]-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id-here.iam.gserviceaccount.com",
  "client_id": "109876543210987654321",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id-here.iam.gserviceaccount.com"
}
```

### 2. The Web App Configuration (`firebaseConfig`)
This is found in Firebase Console > Project Settings > General > Your Apps:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy_YOUR_WEB_API_KEY_STRING_HERE",           // <-- FIREBASE_API_KEY
  authDomain: "your-project-id.firebaseapp.com",           // <-- FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id",                            // <-- FIREBASE_PROJECT_ID
  storageBucket: "your-project-id.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"      // <-- FIREBASE_APP_ID
};
```

---

## Step 6: Configure GitHub Secrets & Variables for CI/CD

1. Open your repository on GitHub (`https://github.com/your-username/your-repo-name`).
2. Click on **Settings** (tab at the top of the repository).
3. In the left sidebar, click **Secrets and variables** > **Actions**.

### 6.1 Add Secrets (Encrypted)
Click **New repository secret** for each of the following:

| Secret Name | Value to Paste |
|---|---|
| **`FIREBASE_SERVICE_ACCOUNT`** | Open the `.json` file you downloaded in Step 4, copy the **entire JSON text** (including `{` and `}`), and paste it directly. |
| **`FIREBASE_API_KEY`** | Paste the `apiKey` string from Step 5 (e.g. `AIzaSyB...`). |
| **`GEMINI_API_KEY`** *(Optional)* | Your Google AI Studio API key if you choose to connect directly via API key instead of GCP IAM. |

### 6.2 Add Variables (Non-Secret)
Switch to the **Variables** tab (next to Secrets) and click **New repository variable** for each:

| Variable Name | Value to Enter |
|---|---|
| **`FIREBASE_PROJECT_ID`** | Your Project ID (e.g., `my-whohum-buddy-12345`). |
| **`FIREBASE_APP_ID`** | Your App ID from Step 5 (e.g., `1:123456789012:web:abcdef...`). |
| **`FIREBASE_AUTH_DOMAIN`** | `your-project-id.firebaseapp.com`. |

---

## Step 7: Deploying the Application

### Method A: Automatic Deployment via GitHub Actions (Recommended)

Once you have added the Secrets and Variables in Step 6:
1. Make any commit to the `main` branch:
   ```bash
   git checkout main
   git commit --allow-empty -m "ci: trigger first automated production deployment"
   git push origin main
   ```
2. In your GitHub repository, click on the **Actions** tab.
3. Click on the workflow run titled **"Continuous Deployment to Firebase"**.
4. GitHub Actions will automatically:
   - Check out your code.
   - Install dependencies.
   - Run unit tests (`npm run test`).
   - Build production assets (`npm run build`).
   - Deploy to Firebase Hosting and release Firestore rules!
5. When complete, your site is live at:
   ```text
   https://<your-project-id>.web.app
   ```

---

### Method B: Direct Deployment from Your Local Terminal

If you prefer deploying directly from your computer without GitHub Actions:

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```
   *(This opens your browser to log into your Google account).*

3. **Link Your Project**:
   ```bash
   cd BuildWithGemini
   firebase use <your-project-id>
   ```

4. **Build the Web Frontend**:
   ```bash
   cd wellness-app
   npm install
   npm run build
   cd ..
   ```

5. **Deploy**:
   ```bash
   firebase deploy --only hosting,firestore:rules
   ```

6. Your app will immediately be live at:
   ```text
   ✔ Deploy complete!
   Hosting URL: https://<your-project-id>.web.app
   ```

---

## 🛠️ Deploying the Backend Agent Engine (Cloud Run)

If you are running the autonomous Gemini ADK agent backend alongside the web app:

1. **Install Google Cloud SDK (`gcloud`)** and log in:
   ```bash
   gcloud auth login
   gcloud config set project <your-project-id>
   ```

2. **Deploy the Agent Engine**:
   ```bash
   # From the project root
   agents-cli deploy
   ```
   Or deploy as a serverless container to Cloud Run:
   ```bash
   gcloud run deploy whohum-agent \
     --source . \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. Copy the resulting Cloud Run URL (e.g. `https://whohum-agent-xxxx.a.run.app`) and set it in your frontend `.env`:
   ```bash
   VITE_AGENT_ENDPOINT="https://whohum-agent-xxxx.a.run.app/chat"
   ```

---

## ❓ Troubleshooting & Common Questions

### Q: Why did the GitHub Action pass before, but the site didn't change?
In the `.github/workflows/deploy.yml` workflow, the deploy step had `continue-on-error: true`. When `FIREBASE_SERVICE_ACCOUNT` was missing, the step skipped and reported success. Once you add `FIREBASE_SERVICE_ACCOUNT` in GitHub Secrets, it performs the real deployment.

### Q: Does Firebase Hosting cost money?
No! Firebase Hosting offers a generous **free tier (Spark Plan)**:
- 10 GB of storage
- 360 MB/day of data transfer
- Free SSL certificate (`.web.app` and `.firebaseapp.com`)
- Free custom domain connection

### Q: Do I need a credit card?
Cloud Firestore and Firebase Hosting work on the free Spark plan without a credit card. If you use Vertex AI on Google Cloud, Google offers a \$300 free trial credit for new accounts.

---

*Made with care for humans • Who-Hum*
