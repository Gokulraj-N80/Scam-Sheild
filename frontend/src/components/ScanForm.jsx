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
      {/* Slow server notice */}
      <div className="slow-server-notice animate-fade-up">
        <span className="slow-server-icon">⚡</span>
        <p>
          If scanning is taking too long, please{" "}
          <strong>refresh the page and try again</strong>.
        </p>
      </div>

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
              className={`btn btn-accent ${loading ? "btn-scanning" : ""}`}
              disabled={!message.trim() || loading}
              style={{ minWidth: "165px" }}
            >
              {loading && <div className="scanning-ring" />}
              {loading ? (
                <>
                  <span style={{ fontSize: "1.1rem", display: "inline-block", animation: "spin 1.5s linear infinite" }}>🔍</span>
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Scan size={16} />
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

      {/* WhatsApp Bot Promo Card */}
      <div className="card whatsapp-promo-card animate-fade-up stagger-2">
        <div className="whatsapp-promo-content">
          <div className="whatsapp-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.001 4.908A9.817 9.817 0 0 0 11.992 2C6.534 2 2.085 6.448 2.08 11.908c0 1.748.458 3.45 1.321 4.956L2 22l5.255-1.377a9.816 9.816 0 0 0 4.73 1.206h.005c5.454 0 9.905-4.447 9.91-9.913a9.813 9.813 0 0 0-2.899-6.992zM11.992 20.12a8.185 8.185 0 0 1-4.177-1.135l-.299-.178-3.105.814.829-3.028-.196-.312a8.179 8.179 0 0 1-1.258-4.373c.003-4.514 3.678-8.19 8.199-8.19a8.15 8.15 0 0 1 5.79 2.402 8.147 8.147 0 0 1 2.4 5.796c-.004 4.515-3.677 8.196-8.188 8.196zm4.492-6.136c-.246-.124-1.455-.717-1.68-.8a.423.423 0 0 0-.308-.01c-.088.123-.343.432-.42.52-.078.087-.156.098-.402-.025a5.068 5.068 0 0 1-1.492-.92 5.584 5.584 0 0 1-1.032-1.285c-.144-.247-.015-.38.109-.504.11-.11.246-.288.37-.432.122-.144.164-.247.246-.412a.406.406 0 0 0-.02-.39c-.06-.124-.555-1.339-.76-1.832-.2-.482-.4-.416-.547-.424l-.467-.006c-.16 0-.422.06-.642.3a2.47 2.47 0 0 0-.771 1.837c0 1.08.787 2.122.896 2.27.11.148 1.547 2.362 3.748 3.313 2.2.95 2.2.633 2.597.596.398-.037 1.455-.595 1.66-1.173.205-.577.205-1.071.144-1.173-.06-.103-.22-.165-.466-.29z"/>
            </svg>
          </div>
          <div className="whatsapp-promo-text">
            <h3>Scan via WhatsApp Bot</h3>
            <p>
              Prefer using WhatsApp? Send or forward any suspicious message, link, or email directly to our official ScamShield WhatsApp bot for instant, real-time safety analysis.
            </p>
          </div>
        </div>
        <a
          href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER ? import.meta.env.VITE_WHATSAPP_NUMBER.replace(/[^0-9]/g, '') : '15551993479'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          Chat on WhatsApp
        </a>
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