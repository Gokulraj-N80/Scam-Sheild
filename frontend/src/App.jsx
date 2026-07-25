import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ScanForm from "./components/ScanForm";
import ResultDisplay from "./components/ResultDisplay";
import Dashboard from "./components/Dashboard";
import HistoryList from "./components/HistoryList";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ShieldAlert, X } from "lucide-react";

const LOADING_MESSAGES = [
  { text: "🛡️ Initializing ScamShield AI Engine...", sub: "Booting Threat Detection Core · Loading Security Modules" },
  { text: "🔤 Preprocessing text...", sub: "Tokenizing · Normalizing · Removing Stop Words" },
  { text: "✂️ Stripping unnecessary words...", sub: "Lemmatization · POS Filtering · spaCy NLP Pipeline" },
  { text: "🔍 Extracting key phrases & entities...", sub: "Named Entity Recognition · NLTK Keyword Extractor" },
  { text: "🧠 Analyzing language patterns...", sub: "Heuristic Threat Engine · Semantic Context Analysis" },
  { text: "🌐 Scanning URLs and domains...", sub: "Domain Reputation Check · Malicious Link Detection" },
  { text: "🤖 Running Gemini 3.6 Flash inference...", sub: "Google Gemini 3.6 Flash API · Scam Signature Match" },
  { text: "⚠️ Calculating scam probability score...", sub: "Weighted Risk Scoring · Fraud Pattern Correlation" },
  { text: "📊 Assessing overall threat level...", sub: "ScamShield Risk Core · Safety Index Computation" },
  { text: "✅ Compiling analysis report...", sub: "Generating Reasons · Building Recommendations" },
];

function LoadingDisplay() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setFade(true);
      }, 300);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const currentMsg = LOADING_MESSAGES[msgIndex];

  return (
    <div className="analyzing-container">
      <div className="spinner-wrap">
        <div className="spinner" />
        <div className="spinner-inner" />
      </div>
      <div
        style={{
          transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
          opacity: fade ? 1 : 0,
          transform: fade ? "translateY(0)" : "translateY(5px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        <p className="pulse-text">{currentMsg.text}</p>
        <p className="pulse-sub">{currentMsg.sub}</p>
      </div>
    </div>
  );
}

function MainContent() {
  const [activeTab, setActiveTab] = useState("scan");
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const { getToken } = useAuth();

  const handleScan = async (messageText) => {
    setScanLoading(true);
    setScanError(null);
    setScanResult(null);
    setShowResult(false);

    try {
      const headers = { "Content-Type": "application/json" };
      const token = await getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/scan`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: messageText }),
      });

      if (!response.ok) throw new Error("Analysis failed. Please check backend status.");

      const data = await response.json();
      setScanResult(data);
      setTimeout(() => setShowResult(true), 80);
    } catch (err) {
      console.error(err);
      setScanError("Failed to communicate with ScamShield API. Ensure the backend server is running.");
    } finally {
      setScanLoading(false);
    }
  };

  const handleViewHistoryResult = (resultItem) => {
    setScanResult({
      prediction: resultItem.prediction,
      probability: resultItem.probability,
      reasons: resultItem.reasons,
      recommendations: resultItem.recommendations,
      nlp_data: resultItem.nlp_data,
      saved: true,
      scan_id: resultItem.id,
    });
    setShowResult(true);
    setActiveTab("scan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setTimeout(() => {
      setScanResult(null);
      setScanError(null);
    }, 300);
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />



      <main className="content-container">
        {activeTab === "scan" && (
          <div className="scan-layout">
            {/* Scan Form */}
            <ScanForm onScan={handleScan} loading={scanLoading} />

            {/* Loading state */}
            {scanLoading && (
              <div className="card animate-fade-up" style={{ padding: "0" }}>
                <LoadingDisplay />
              </div>
            )}

            {/* Error state */}
            {scanError && !scanLoading && (
              <div className="card animate-fade-up" style={{ borderLeft: "4px solid var(--danger)", padding: "1.25rem 1.5rem" }}>
                <div style={{ display: "flex", gap: "0.875rem", alignItems: "center" }}>
                  <ShieldAlert size={24} style={{ color: "var(--danger)", flexShrink: 0 }} />
                  <div>
                    <p style={{ color: "var(--danger)", fontWeight: 700, fontSize: "0.9rem" }}>Analysis Failed</p>
                    <p style={{ color: "var(--muted-fg)", fontSize: "0.82rem", marginTop: "0.2rem" }}>{scanError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Result — shown below form */}
            {scanResult && showResult && (
              <div className="scan-result-wrapper">
                <div className="result-close-row">
                  <button className="result-close-btn" onClick={handleCloseResult}>
                    <X size={13} />
                    Close Results
                  </button>
                </div>
                <ResultDisplay result={scanResult} />
              </div>
            )}
          </div>
        )}

        {activeTab === "dashboard" && (
          <Dashboard setActiveTab={setActiveTab} setViewResult={handleViewHistoryResult} />
        )}

        {activeTab === "history" && (
          <HistoryList setActiveTab={setActiveTab} setViewResult={handleViewHistoryResult} />
        )}
      </main>


    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}