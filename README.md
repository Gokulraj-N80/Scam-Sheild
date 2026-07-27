# ScamShield — Advanced AI Fraud & Scam Detector

ScamShield is an intelligent, full-stack cybersecurity application that analyzes messages, emails, and links for phishing, fraud, and scam indicators in real-time. By combining NLP (Natural Language Processing) preprocessing with Google's Gemini AI, ScamShield identifies threat characteristics, calculates risk probabilities, and suggests safety recommendations.

---

### 🌐 Live Deployment
👉 **[Launch ScamShield Live Demo](https://scam-sheild-w5c9.onrender.com/)**

---

## 🔮 System Architecture

The workflow details the end-to-end processing pipeline from user message input to real-time AI evaluation and persistence:

```mermaid
graph TD
    subgraph Client ["Client Interface (React / Vite)"]
        UI["Interactive Dashboard"] -->|Sends Text| ScanAPI["POST /api/scan"]
        Auth["Firebase Google OAuth"] -->|Auth State| UI
    end

    subgraph Preprocessing ["NLP pipeline (spaCy + NLTK)"]
        ScanAPI --> Clean["Text Cleaning"]
        Clean --> Lemma["Lemmatization"]
        Clean --> NER["Named Entity Recognition"]
        Clean --> Keywords["Keyword Extraction"]
    end

    subgraph AI ["AI Analysis Core"]
        Lemma & NER & Keywords -->|Contextual Prompt| Gemini["Gemini 3.6 Flash"]
        Gemini -->|JSON Response| Logic["Risk Score & Recommendations"]
    end

    subgraph Storage ["Persistence Layer"]
        Logic -->|Save History| DB{Firebase / Mock JSON}
        DB -->|Render Report| UI
    end

    %% Style Configuration
    style UI fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Gemini fill:#4c1d95,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style DB fill:#78350f,stroke:#d97706,stroke-width:2px,color:#fff
    style Preprocessing fill:#064e3b,stroke:#059669,stroke-width:1px,color:#fff
```

---

## ✨ Features

- **Real-Time Gemini Inference:** Uses `gemini-3.6-flash` via the `google-genai` SDK to evaluate semantic threat characteristics (pressure tactics, financial baits, credential harvesting).
- **Dual-Engine NLP Pipeline:** Preprocesses raw message strings with **spaCy** (`en_core_web_sm`) and **NLTK** for tokenization, lemmatization, and keyword/entity parsing before prompting the model.
- **Dynamic Frontend Client:** A React (Vite) dashboard built using TailwindCSS and Lucide React icons, complete with real-time multi-step loading animations.
- **Analytics & History Tracking:** View aggregate stats, risk distributions, and threat histories on an interactive, responsive user dashboard.
- **Fail-Safe Local Database:** Seamless fallback mode (`mock_db.json`) for authentication and history storage when Firebase credentials are not configured.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), TailwindCSS, Recharts, Lucide React |
| **Backend** | Python 3.10+, FastAPI, Uvicorn Server |
| **AI / NLP** | Google GenAI Client, spaCy (`en_core_web_sm`), NLTK |
| **Database & Auth** | Firebase Firestore, Firebase Authentication |

---

## 🚀 Quick Setup & Installation

### 1. Setup Backend Server

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure your environment variables inside a `backend/.env` file:
   ```env
   PORT=8000
   GEMINI_API_KEY="your-gemini-api-key"
   USE_MOCK_DATABASE=False # Set to True to use local mock database without Firebase config

   # Optional Firebase config
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="your-client-email"
   FIREBASE_PRIVATE_KEY="your-private-key"
   ```
4. Start the FastAPI server:
   ```bash
   python run.py
   ```
   The API will be available at `http://localhost:8000`.

---

### 2. Setup React Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `frontend/.env` file to configure backend endpoints:
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_USE_MOCK_AUTH=False # Set to True to bypass Firebase Authentication
   VITE_GOOGLE_CLIENT_ID="your-google-oauth-client-id"
   ```
4. Launch the local dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 💡 Troubleshooting

> [!NOTE]
> **Google OAuth Port Conflicts**
> Google OAuth requires matching authorized redirect origins. Ensure your React server runs strictly on port `5173`. If it runs on another port, terminate any background tasks using `5173` and restart.

> [!TIP]
> **Zero-Config Offline Mode**
> To run the app immediately without configuring Firebase, set `USE_MOCK_DATABASE=True` in your backend `.env` and `VITE_USE_MOCK_AUTH=True` in your frontend `.env`.
