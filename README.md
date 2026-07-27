# 🛡️ ScamShield — AI-Powered Scam & Phishing Detector

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-brightgreen?style=for-the-badge&logo=render&logoColor=white)](https://scam-sheild-w5c9.onrender.com/)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**An intelligent, full-stack cybersecurity web application designed to analyze text messages, emails, and links for phishing, fraud, and scam indicators in real-time.**

[🌐 Access the Live Demo](https://scam-sheild-w5c9.onrender.com/)

</div>

---

## 🚀 Key Features

*   **🧠 Google Gemini AI Core:** Harnesses the power of `gemini-3.6-flash` via the new `google-genai` SDK to perform deep semantic risk evaluation, identifying high-pressure urgency, financial lures, impersonation, data/credential theft, and tech support scams.
*   **⚙️ Advanced NLP Pipeline:** Integrates **spaCy** (`en_core_web_sm`) and **NLTK** to clean raw text, extract lemmas, detect named entities, and map lexical keywords before sending them as contextual metadata to the AI.
*   **💻 Premium React Dashboard:** Features a clean, responsive UI built with TailwindCSS, Lucide React icons, and dynamic, multi-step scanning animations to visualize the analysis flow.
*   **📊 Analytics Dashboard:** Interactive charts showing aggregate stats on scan history, risk distribution, and threat frequencies.
*   **💾 Flexible Persistence Layer:** Configured to save history securely to **Firebase Firestore**, with a seamless automatic local JSON database fallback (`mock_db.json`) for zero-config offline runs.
*   **🔐 Secure Google OAuth 2.0:** Integrated with Firebase Authentication to support secure user accounts, history tracking, and analytics dashboards.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), TailwindCSS, Chart.js / Recharts, Lucide React |
| **Backend** | Python 3.10+, FastAPI, Uvicorn Server |
| **AI / NLP** | Google GenAI SDK (Gemini), spaCy (English Model), NLTK |
| **Database & Auth** | Firebase Firestore, Firebase Authentication |

---

## ⚙️ Project Setup

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js (v18+)](https://nodejs.org/)
*   [Python (v3.10+)](https://www.python.org/)
*   Git

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2. **Install the dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3. **Download the spaCy English NLP model**:
    ```bash
    python -m spacy download en_core_web_sm
    ```
4. **Configure your environment**: Create a `backend/.env` file:
    ```env
    PORT=8000
    GEMINI_API_KEY="your-gemini-api-key-here"
    USE_MOCK_DATABASE=False # Set to True to bypass Firebase setup and use local json db

    # (Optional) Firebase configurations for database/history
    FIREBASE_PROJECT_ID="your-firebase-project-id"
    FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
    FIREBASE_PRIVATE_KEY="your-firebase-private-key-here"
    ```
5. **Run the FastAPI server**:
    ```bash
    python run.py
    ```
    The backend runs locally on **`http://localhost:8000`**.

---

### 3. Frontend Setup

1. **Navigate to the frontend directory**:
    ```bash
    cd ../frontend
    ```
2. **Install npm packages**:
    ```bash
    npm install
    ```
3. **Configure your environment**: Create a `frontend/.env` file:
    ```env
    VITE_API_URL=http://localhost:8000/api
    VITE_USE_MOCK_AUTH=False # Set to True to run auth with mock credentials
    VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
    ```
4. **Start the development server**:
    ```bash
    npm run dev
    ```
    Access the application on **`http://localhost:5173`**.

---

## 🔍 Architecture & Processing Pipeline

```
[ User Input Message ]
         │
         ▼
 1. [ NLP Preprocessing (spaCy + NLTK) ]
    ├── Tokenization & Lemma Extraction
    ├── Named Entity Recognition (NER)
    └── Keyword and Phrase Matching
         │
         ▼
 2. [ Google Gemini AI Threat Analysis ]
    ├── Prompt Synthesis with NLP context
    ├── Semantic Intent Classification
    └── Risk Scoring (Safe / Suspicious / High Risk)
         │
         ▼
 3. [ Storage & Rendering ]
    ├── Save record to Firestore (or local JSON)
    └── Render response with full recommendations
```

---

## 💡 Troubleshooting

> [!NOTE]
> **Google OAuth 400: origin_mismatch**
> *   Ensure the application is running exactly on port `5173` (e.g., `http://localhost:5173`).
> *   If port `5173` is occupied, identify the process using it (e.g., run `netstat -ano | findstr 5173` on Windows) and terminate it.

> [!TIP]
> **Database Fallback**
> *   If you don't have a Firebase project setup yet, set `USE_MOCK_DATABASE=True` in `backend/.env` and `VITE_USE_MOCK_AUTH=True` in `frontend/.env` to run the application immediately with local mock storage.
