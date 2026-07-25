import React from "react";
import {
  AlertTriangle, ShieldCheck, HelpCircle, ShieldAlert, Cpu, CheckCircle,
} from "lucide-react";

export default function ResultDisplay({ result }) {
  if (!result) return null;

  const { prediction, probability, reasons, recommendations, nlp_data, saved } = result;
  const isScam = prediction === "Scam";

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (probability / 100) * circumference;

  return (
    <div className={`result-card ${isScam ? "scam" : "safe"} animate-scale-in`}>
      {/* SVG defs for gradients */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="scam-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#FB7185" />
          </linearGradient>
          <linearGradient id="safe-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>

      {/* Top verdict bar */}
      <div className={`result-top-bar ${isScam ? "scam" : "safe"}`}>
        <div className="result-verdict">
          <div className={`result-verdict-icon ${isScam ? "scam" : "safe"}`}>
            {isScam
              ? <AlertTriangle size={20} color="#fff" />
              : <ShieldCheck size={20} color="#fff" />
            }
          </div>
          <div>
            <div className={`result-verdict-label ${isScam ? "scam" : "safe"}`}>
              {isScam ? "Scam Detected" : "Safe Message"}
            </div>
            <div className="result-verdict-sub">
              {isScam
                ? "This message shows signs of fraudulent activity"
                : "No significant scam indicators were detected"
              }
            </div>
          </div>
        </div>

        <div>
          <div className={`result-badge ${isScam ? "scam" : "safe"}`}>
            {isScam ? <><AlertTriangle size={12} /> SCAM DETECTED</> : <><ShieldCheck size={12} /> SAFE MESSAGE</>}
          </div>
          {saved && (
            <div className="saved-chip">
              <CheckCircle size={13} />
              Saved to logs
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="result-body">

        {/* Threat score row */}
        <div className="threat-score-row">
          {/* Gauge */}
          <div className="gauge-circle">
            <svg className="gauge-svg" viewBox="0 0 100 100">
              <circle className="gauge-track" cx="50" cy="50" r={radius} />
              <circle
                className={`gauge-fill ${isScam ? "scam" : "safe"}`}
                cx="50" cy="50" r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="gauge-text">
              <span className={`gauge-percent ${isScam ? "scam" : "safe"}`}>{probability}%</span>
              <span className="gauge-label">Threat</span>
            </div>
          </div>

          {/* Score details */}
          <div className="score-details">
            <h4>{isScam ? "⚠ High Threat Risk" : "✓ Minimal / No Risk"}</h4>
            <p>
              {isScam
                ? `Our AI model detected a ${probability}% probability that this message is a scam. We recommend extreme caution.`
                : `Our AI model detected only a ${probability}% threat score. This message appears to be safe.`
              }
            </p>
            <div className="score-bar-row">
              <div className="score-bar-labels">
                <span>Threat Score</span>
                <span>{probability}%</span>
              </div>
              <div className="score-bar-track">
                <div
                  className={`score-bar-fill ${isScam ? "scam" : "safe"}`}
                  style={{ "--bar-w": `${probability}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Two-column: Threat indicators + Action plan */}
        <div className="grid-2" style={{ gap: "1.25rem" }}>
          {/* Threat Indicators */}
          <div className="result-section">
            <div className="result-section-title">
              <ShieldAlert size={14} style={{ color: isScam ? "var(--danger)" : "var(--success)" }} />
              Threat Indicators
            </div>
            <ul className="result-list">
              {reasons && reasons.length > 0 ? (
                reasons.map((reason, idx) => (
                  <li key={idx} className="result-list-item reason">
                    <AlertTriangle size={14} style={{ color: "var(--danger)", marginTop: "0.1rem" }} />
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <li className="result-list-item">
                  <ShieldCheck size={14} style={{ color: "var(--success)" }} />
                  No active scam indicators found.
                </li>
              )}
            </ul>
          </div>

          {/* Action Plan */}
          <div className="result-section">
            <div className="result-section-title">
              <HelpCircle size={14} style={{ color: "var(--primary)" }} />
              Recommended Actions
            </div>
            <ul className="result-list">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <li key={idx} className="result-list-item recommendation">
                    <ShieldCheck size={14} style={{ color: "var(--primary)", marginTop: "0.1rem" }} />
                    <span>{rec}</span>
                  </li>
                ))
              ) : (
                <li className="result-list-item recommendation">
                  Standard handling precautions apply.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* NLP Details */}
        {nlp_data && (
          <details className="nlp-section">
            <summary>
              <Cpu size={14} />
              <span>Preprocessing &amp; NLP Details (spaCy + NLTK)</span>
            </summary>
            <div className="nlp-content">
              <div className="nlp-meta-grid">
                <div className="nlp-meta-card">
                  <div className="nlp-meta-val">{nlp_data.original_length}</div>
                  <div className="nlp-meta-lbl">Original Chars</div>
                </div>
                <div className="nlp-meta-card">
                  <div className="nlp-meta-val">{nlp_data.cleaned_length}</div>
                  <div className="nlp-meta-lbl">Cleaned Chars</div>
                </div>
                <div className="nlp-meta-card">
                  <div className="nlp-meta-val">{nlp_data.token_count} / {nlp_data.original_token_count}</div>
                  <div className="nlp-meta-lbl">Lemmas Filtered</div>
                </div>
              </div>

              <div>
                <div className="nlp-sub-title">Preprocessed Lemmas Sent to AI</div>
                <div className="nlp-cleaned-box">
                  {nlp_data.cleaned_text || <span style={{ fontStyle: "italic", color: "var(--muted-fg)" }}>None</span>}
                </div>
              </div>

              {nlp_data.keywords && nlp_data.keywords.length > 0 && (
                <div>
                  <div className="nlp-sub-title">Extracted Core Keywords</div>
                  <div className="tags-container">
                    {nlp_data.keywords.map((kw, i) => (
                      <span key={i} className="tag">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {nlp_data.entities && nlp_data.entities.length > 0 && (
                <div>
                  <div className="nlp-sub-title">Named Entities (spaCy)</div>
                  <div className="tags-container">
                    {nlp_data.entities.map((ent, i) => (
                      <span key={i} className="tag entity">
                        {ent.text}{" "}
                        <strong style={{ fontSize: "0.6rem", opacity: 0.75 }}>({ent.label})</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}