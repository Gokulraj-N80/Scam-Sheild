import React, { useEffect, useState } from "react";
import { Trash2, Eye, RefreshCw, ShieldAlert, History } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function HistoryList({ setActiveTab, setViewResult }) {
  const { getToken, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch scan history");
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve scan history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (scanId) => {
    if (!window.confirm("Are you sure you want to delete this scan from your history?")) {
      return;
    }

    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/history/${scanId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete record");
      }

      setHistory((prevHistory) => prevHistory.filter((item) => item.id !== scanId));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleInspect = (scanItem) => {
    setViewResult(scanItem);
    setActiveTab("scan");
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown Date";
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--muted-fg)" }}>
        <p style={{ fontSize: "0.9rem" }}>Loading scan history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ marginTop: "1.5rem", textAlign: "center", padding: "1.5rem" }}>
        <ShieldAlert size={32} style={{ color: "var(--danger)", marginBottom: "0.75rem" }} />
        <p style={{ color: "var(--danger)", fontWeight: 500, fontSize: "0.9rem", marginBottom: "0.75rem" }}>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={fetchHistory}>
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }} className="animate-fade-up">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "var(--font-display)" }}>
            <History size={18} style={{ color: "var(--primary)" }} />
            Records ({history.length})
          </h4>
          <button className="btn btn-secondary btn-sm" onClick={fetchHistory} title="Reload history">
            <RefreshCw size={12} />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="empty-state" style={{ padding: "1.5rem" }}>
            <History size={32} />
            <p style={{ fontSize: "0.85rem" }}>No scan history yet.</p>
          </div>
        ) : (
          <div className="history-table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Message Preview</th>
                  <th>Classification</th>
                  <th>Threat Score</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((scan) => (
                  <tr key={scan.id}>
                    <td data-label="Message Preview">
                      <div className="msg-preview" title={scan.message}>
                        {scan.message}
                      </div>
                    </td>
                    <td data-label="Classification">
                      <span className={`badge ${scan.prediction === "Scam" ? "scam" : "safe"}`}>
                        {scan.prediction}
                      </span>
                    </td>
                    <td data-label="Threat Score">
                      <div className="score-cell">
                        <strong style={{ color: scan.prediction === "Scam" ? "var(--danger)" : "var(--success)" }}>
                          {scan.probability}%
                        </strong>
                        <div className="score-bar-track">
                          <div
                            className={`score-bar-fill ${scan.prediction === "Scam" ? "scam" : "safe"}`}
                            style={{ width: `${scan.probability}%`, animation: "none" }}
                          />
                        </div>
                      </div>
                    </td>
                    <td data-label="Date" style={{ color: "var(--muted-fg)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {formatDate(scan.timestamp)}
                    </td>
                    <td data-label="Actions" style={{ whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleInspect(scan)}
                          style={{ display: "inline-flex", padding: "0.22rem 0.5rem", fontSize: "0.75rem", gap: "0.25rem" }}
                        >
                          <Eye size={11} /> View
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(scan.id)}
                          style={{ display: "inline-flex", padding: "0.22rem 0.5rem", fontSize: "0.75rem", gap: "0.25rem" }}
                          title="Delete record"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}