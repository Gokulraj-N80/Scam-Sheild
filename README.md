# ScamShield - AI-Powered Scam & Phishing Detector

ScamShield is an intelligent, full-stack cybersecurity web application designed to analyze text messages, emails, and links for phishing, fraud, and scam indicators. By combining robust Natural Language Processing (NLP) with Google's Gemini AI, ScamShield identifies threat characteristics, calculates real-time risk scores, and provides structured safety recommendations.

---

## 🚀 Key Features

*   **Google Gemini AI Core:** Uses advanced generative models to perform deep semantic risk evaluation, detecting urgency markers, financial requests, PII demands, and suspicious URLs.
*   **NLP Preprocessing Pipeline:** Integrated with **spaCy** and **NLTK** to tokenize, lemma-extract, identify named entities, and analyze lexical patterns prior to classification.
*   **Interactive Scanner UI:** A premium React dashboard featuring a real-time scanner with dynamic, rotating loading messages that visualize the processing steps.
*   **Analytics Dashboard:** Interactive charts showing aggregate stats on scan history, risk distribution, and threat frequencies.
*   **Flexible Data Persistence:** Powered by **Firebase Firestore** with an automatic local JSON database fallback (`mock_db.json`) for zero-config offline runs.
*   **Google OAuth 2.0:** Secure user sign-in options integrated with Firebase Authentication.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite), TailwindCSS, Lucide React icons.
*   **Backend:** Python 3.10+, FastAPI, Uvicorn server.
*   **AI/NLP Core:** Google Generative AI (Gemini), spaCy (`en_core_web_sm`), NLTK.
*   **Database & Auth:** Firebase Auth, Firebase Firestore.

---

## ⚙️ Project Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js (v18+)](https://nodejs.org/)
*   [Python (v3.10+)](https://www.python.org/)
*   Git

---

### 2. Backend Setup
1. Navigate to the backend directory:
    ```bash
    cd backend
    ```
2. Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3. Download the spaCy English NLP model:
    ```bash
    python -m spacy download en_core_web_sm
    ```
4. Configure your environment variables. Create a `backend/.env` file with the following variables:
    ```env
    PORT=8000
    GEMINI_API_KEY="your-gemini-api-key-here"
    USE_MOCK_DATABASE=False # Set to True to bypass Firebase setup and use local json db

    # (Optional) Firebase configurations for database/history
    FIREBASE_PROJECT_ID="your-firebase-project-id"
    FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
    FIREBASE_PRIVATE_KEY="your-firebase-private-key-here"
    ```
5. Run the FastAPI server:
    ```bash
    python run.py
    ```
    The backend will start running on **`http://localhost:8000`**.

---

### 3. Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install npm packages:
    ```bash
    npm install
    ```
3. Configure your environment variables. Create a `frontend/.env` file:
    ```env
    VITE_API_URL=http://localhost:8000/api
    VITE_USE_MOCK_AUTH=False # Set to True to run auth with mock credentials
    VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
    ```
4. Start the development server:
    ```bash
    npm run dev
    ```
    Vite will start the development server. Access the application on **`http://localhost:5173`**.

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

*   **Google OAuth 400: origin_mismatch:**
    *   Ensure the application is running exactly on port `5173` (e.g., `http://localhost:5173`).
    *   If port `5173` is occupied, identify the process using it (e.g., run `netstat -ano | findstr 5173` on Windows, or `lsof -i :5173` on macOS/Linux) and terminate it.
*   **Database Fallback:**
    *   If you don't have a Firebase project setup yet, set `USE_MOCK_DATABASE=True` in `backend/.env` and `VITE_USE_MOCK_AUTH=True` in `frontend/.env` to run the application immediately with local mock storage.
