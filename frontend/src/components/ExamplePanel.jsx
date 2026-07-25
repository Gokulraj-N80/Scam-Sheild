import React, { useState } from "react";
import { Copy, Check, AlertTriangle, X, CheckCircle2 } from "lucide-react";

const SCAM_EXAMPLES = [
  {
    label: "Phishing — Bank",
    text: "URGENT: Your bank account has been locked due to an unauthorized login. Click here immediately to verify your identity and unlock your account: http://mockbank-security.com/verify",
  },

  {
    label: "Fake Alert — Netflix",
    text: "Your Netflix payment failed. Update your card immediately to avoid account suspension. Click here: http://netflix-billing-verify.com/secure-update",
  },
  {
    label: "Prize Scam — Walmart",
    text: "Congratulations! You've been selected to receive a $1,000 Walmart gift card as part of our customer appreciation promotion. Claim your reward at http://walmart-prize-claim.com",
  },
  {
    label: "Fake Security — Google",
    text: "Warning: Your Gmail storage is full. Click here to upgrade your plan now and avoid losing important emails: http://gmail-storage-alert.com/upgrade",
  },
];

const SAFE_EXAMPLES = [
  {
    label: "Personal Chat",
    text: "Hey, are we still meeting for lunch today at 1 PM? Let me know, thanks!",
  },
  {
    label: "Delivery Notification",
    text: "Your package has been delivered to the parcel locker. Code to open: 482910. Have a nice day!",
  },
  {
    label: "Business Email",
    text: "Hello Team, please find attached the revised project requirements document. Let me know if you have any questions.",
  },
  {
    label: "Authentication Code",
    text: "Your security verification code is: 849201. This code expires in 10 minutes. Do not share it with anyone.",
  },
  {
    label: "Appointment Reminder",
    text: "Reminder: Your annual dental checkup is scheduled for tomorrow at 10:00 AM. If you need to reschedule, please call our office.",
  },
];

export default function ExamplePanel({ onSelect, onClose }) {
  const [activeTab, setActiveTab] = useState("scam");
  const [copiedIdx, setCopiedIdx] = useState(null);

  const handleCopy = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const currentExamples = activeTab === "scam" ? SCAM_EXAMPLES : SAFE_EXAMPLES;

  return (
    <div className="example-panel-overlay" onClick={onClose}>
      <div className="example-panel" onClick={(e) => e.stopPropagation()}>
        <div className="example-panel-header">
          <div className="example-panel-header-left">
            {activeTab === "scam" ? (
              <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
            ) : (
              <CheckCircle2 size={20} style={{ color: "var(--success)" }} />
            )}
            <h3>Example Messages</h3>
          </div>
          <button className="example-panel-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <p className="example-panel-desc">
          Click any message to copy it, or click 'Try It' to load it into the scanner.
        </p>

        <div className="panel-tabs">
          <button
            className={`panel-tab-btn scam ${activeTab === "scam" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("scam");
              setCopiedIdx(null);
            }}
          >
            <AlertTriangle size={13} />
            Scam Messages
          </button>
          <button
            className={`panel-tab-btn safe ${activeTab === "safe" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("safe");
              setCopiedIdx(null);
            }}
          >
            <CheckCircle2 size={13} />
            Normal Messages
          </button>
        </div>

        <div className="example-panel-list">
          {currentExamples.map((example, idx) => (
            <div key={idx} className="example-card">
              <div className={`example-card-label ${activeTab === "safe" ? "safe" : ""}`}>
                {activeTab === "scam" ? (
                  <AlertTriangle size={13} style={{ color: "var(--danger)" }} />
                ) : (
                  <CheckCircle2 size={13} style={{ color: "var(--success)" }} />
                )}
                <span>{example.label}</span>
              </div>
              <p className="example-card-text">{example.text}</p>
              <div className="example-card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleCopy(example.text, idx)}
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check size={13} style={{ color: "var(--success)" }} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      Copy
                    </>
                  )}
                </button>
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => onSelect(example.text)}
                >
                  Try It
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}