# 🛡️ ScamShield — Project Report
**Repo:** [Gokulraj-N80/Scam-Sheild](https://github.com/Gokulraj-N80/Scam-Sheild) · **Branch:** `main`  
**Date:** 25 July 2026

---

## Overview

**ScamShield** is a full-stack AI-powered scam detection web application. Users paste any suspicious message (SMS, WhatsApp, email, social media) and receive an instant threat analysis — classifying the message as **Scam** or **Safe**, with a probability score, reasons, and recommendations.

---

## Architecture

```
┌─────────────────────┐        HTTP/REST        ┌──────────────────────────┐
│   Frontend (Vite)   │ ──────────────────────► │   Backend (FastAPI)       │
│   React + CSS       │   http://localhost:5173  │   http://localhost:8000   │
└─────────────────────┘                          └──────────────────────────┘
                                                          │
                              ┌───────────────────────────┼───────────────────┐
                              ▼                           ▼                   ▼
                     🤖 Gemini 3.6 Flash        🧠 spaCy + NLTK       🔥 Firebase
                        (LLM Analysis)          (NLP Preprocessing)    (Auth + DB)
```

---

## Tech Stack

### 🖥️ Frontend
| Item | Detail |
|------|--------|
| Framework | **React** (via Vite) |
| Styling | **Vanilla CSS** (custom design system, 51 KB) |
| Auth | **Firebase Auth** (Google OAuth) |
| Icons | Lucide React |
| Components | `Navbar`, `ScanForm`, `ResultDisplay`, `Dashboard`, `HistoryList`, `ExamplePanel` |

### ⚙️ Backend
| Item | Detail |
|------|--------|
| Framework | **FastAPI** + Uvicorn |
| AI Model | **Google Gemini 3.6 Flash** |
| NLP | **spaCy** (tokenization, lemmatization, NER) + **NLTK** (keyword extraction) |
| Database | **Firebase Firestore** (Live mode) |
| Auth Middleware | Firebase Admin SDK (JWT token verification) |

---

## How It Works

```
User Input
    │
    ▼
① NLP Preprocessing  (spaCy)
   - Tokenize · Normalize · Remove stop words
   - Lemmatize · POS filter · Extract named entities
    │
    ▼
② Keyword & Pattern Extraction  (NLTK + regex)
   - Keywords, URLs, urgency phrases, PII patterns
    │
    ▼
③ Gemini 3.6 Flash Inference
   - Full prompt with 10 scam categories
   - Returns: prediction, probability, reasons, recommendations
    │
    ▼
④ Result saved to Firebase Firestore
    │
    ▼
⑤ Response returned to Frontend → ResultDisplay
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scan` | Analyze a message for scams |
| `GET` | `/api/history` | Get user's scan history |
| `GET` | `/api/history/dashboard` | Dashboard stats (totals, ratios) |
| `DELETE` | `/api/history/{id}` | Delete a scan record |

---

## Key Features

- 🤖 **AI Analysis** — Gemini 3.6 Flash with a detailed 10-category scam detection prompt
- 🧠 **NLP Pipeline** — spaCy lemmatization + NLTK keyword extraction before AI call
- 🔒 **Google Auth** — Firebase OAuth, all routes JWT-protected
- 📊 **Dashboard** — Total scans, scam/safe count, threat ratio bar
- 📜 **History** — Full scan log with delete and re-inspect
- 🎭 **Mock Fallback** — Rule-based weighted keyword engine when Gemini API key is missing
- ⚡ **Animated Loading** — 10-step loading sequence showing real pipeline stages
- 📱 **Responsive UI** — Mobile-friendly dark-mode design

---

## Scam Categories Detected

1. Impersonation & Authority Spoofing
2. Urgency & Pressure tactics
3. Emotional Manipulation
4. Financial Lures (crypto, gift cards, wire transfer)
5. Credential & Data Theft (OTP, SSN, passwords)
6. Malicious Links & Attachments
7. Tech Support Scams
8. Romance & Relationship Scams
9. Government & Legal Threats
10. Fake Giveaways

---

## Recent Changes (this session)

| File | Change |
|------|--------|
| [`frontend/src/App.jsx`](file:///e:/ScamDetector/frontend/src/App.jsx) | Expanded loading steps from 8 → 10; added Gemini 3.6 Flash label; improved sub-text to reflect real NLP pipeline stages |
| [`backend/app/services/gemini_service.py`](file:///e:/ScamDetector/backend/app/services/gemini_service.py) | Added inline comment labeling `gemini-3.6-flash` model |

**Commit:** `021635b` pushed to `origin/main`
