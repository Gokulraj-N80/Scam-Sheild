import React, { useState } from "react";
import { LogIn, MessageSquare, Scan, Lightbulb } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ExamplePanel from "./ExamplePanel";

export default function ScanForm({ onScan, loading }) {
  const [message, setMessage] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  const { user, loginWithGoogle } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    onScan(message);
  };

  const handleQuickFill = (text) => setMessage(text);

  const charPct = Math.round((message.length / 2000) * 100);

  return (
    <div className="scan-form-container">
      {!user && (
        <div className="login-prompt-banner animate-fade-up">
          <div className="login-prompt-text">
            <h3>🔒 Protect Your Scan History</h3>
            <p>Sign in to automatically save scan logs and access your analytics dashboard.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={loginWithGoogle}>
            <LogIn size={15} />
            Sign In with Google
          </button>
        </div>
      )}

      <div className="card animate-fade-up stagger-1 scan-main-form">
        <div className="scan-card-header">
          <div className="scan-card-header-icon">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2>Analyze Message for Scams</h2>
            <p>Paste any suspicious message, email, or link below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="textarea-container" style={{ marginBottom: "1rem" }}>
            <textarea
              className="scan-textarea"
              placeholder="Paste a suspicious SMS, email, WhatsApp message, or website link here to scan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              disabled={loading}
            />
            <div className="textarea-counter">{message.length} / 2000</div>
          </div>

          {message.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <div className="score-bar-track" style={{ height: "3px" }}>
                <div
                  className="score-bar-fill safe"
                  style={{ "--bar-w": `${charPct}%`, width: `${charPct}%`, animation: "none" }}
                />
              </div>
            </div>
          )}

          <div className="scan-actions" style={{ justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="btn btn-accent"
              disabled={!message.trim() || loading}
              style={{ minWidth: "155px" }}
            >
              {loading ? (
                <>
                  <div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scan size={15} />
                  Scan Message
                </>
              )}
            </button>
          </div>
        </form>

        <div className="try-example-inline">
          <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
            <div style={{ background: "var(--violet-50)", padding: "0.5rem", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lightbulb size={20} style={{ color: "var(--amber-500)" }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.92rem", fontWeight: "600", color: "var(--foreground)" }}>Need sample messages to test?</h3>
              <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.8rem", color: "var(--muted-fg)" }}>
                Explore real scam alerts and benign conversation templates.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowExamples(true)}
            disabled={loading}
          >
            Try Example Messages
          </button>
        </div>
      </div>

      {showExamples && (
        <ExamplePanel
          onSelect={(text) => {
            setMessage(text);
            setShowExamples(false);
          }}
          onClose={() => setShowExamples(false)}
        />
      )}
    </div>
  );
}