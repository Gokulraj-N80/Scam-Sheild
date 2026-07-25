import React, { useEffect, useState } from "react";
import { ShieldAlert, ShieldCheck, Layers, RefreshCw, Eye, MessageSquareWarning } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard({ setActiveTab, setViewResult }) {
  const { getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/history/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load dashboard metrics");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError("Unable to communicate with the service. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown Date";
    }
  };

  const handleInspect = (scanItem) => {
    setViewResult(scanItem);
    setActiveTab("scan");
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--muted-fg)" }}>
        <p style={{ fontSize: "0.9rem" }}>Syncing dashboard statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
        <ShieldAlert size={48} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
        <p style={{ color: "var(--danger)", fontWeight: 600, marginBottom: "1rem" }}>{error}</p>
        <button className="btn btn-secondary" onClick={fetchDashboardStats}>
          <RefreshCw size={14} /> Retry Sync
        </button>
      </div>
    );
  }

  const { total_scans, scam_count, safe_count, recent_scans } = stats || {
    total_scans: 0,
    scam_count: 0,
    safe_count: 0,
    recent_scans: [],
  };

  const ratio = total_scans > 0 ? Math.round((scam_count / total_scans) * 100) : 0;

  return (
    <div className="animate-fade-up">
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Layers size={24} />
          </div>
          <div>
            <div className="stat-value text-gradient">{total_scans}</div>
            <div className="stat-label">Total Messages Scanned</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon scam">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: "var(--danger)" }}>{scam_count}</div>
            <div className="stat-label">Scam Messages Detections</div>
          </div>
          {total_scans > 0 && (
            <div className="threat-ratio-bar">
              <div className="threat-ratio-label">
                <span>Threat Ratio</span>
                <span>{ratio}%</span>
              </div>
              <div className="threat-ratio-track">
                <div className="threat-ratio-fill" style={{ width: `${ratio}%` }}></div>
              </div>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-icon safe">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: "var(--success)" }}>{safe_count}</div>
            <div className="stat-label">Safe Messages Cleared</div>
          </div>
        </div>
      </div>

    </div>
  );
}