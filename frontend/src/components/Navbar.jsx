import React, { useState } from "react";
import { Shield, LogIn, LogOut, LayoutDashboard, History, MessageSquareWarning, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, loginWithGoogle, logout, isMock } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  const handleNav = (tab) => {
    setActiveTab(tab);
    closeDrawer();
  };

  return (
    <header className="navbar">
      {/* Brand */}
      <div className="nav-brand" onClick={() => setActiveTab("scan")}>
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
        </svg>
        <Shield size={26} style={{ stroke: "url(#brand-gradient)", filter: "drop-shadow(0 0 6px rgba(124,58,237,0.35))" }} />
        <span>ScamShield</span>
      </div>

      <div className="nav-actions">
        {/* Hamburger button */}
        <button className="hamburger-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <div className={`hamburger-icon ${drawerOpen ? "open" : ""}`}>
            <span />
            <span />
            <span />
          </div>
        </button>

        {/* Navigation tabs (visible on wider screens) */}
        <div className="nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === "scan" ? "active" : ""}`}
            onClick={() => setActiveTab("scan")}
          >
            <MessageSquareWarning size={14} />
            Scanner
          </button>

          {user && (
            <>
              <button
                className={`nav-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>
              <button
                className={`nav-tab-btn ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                <History size={14} />
                History
              </button>
            </>
          )}
        </div>

        {/* Auth */}
        {user ? (
          <div className="user-profile">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="user-avatar"
              onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/identicon/svg?seed=shield"; }}
            />
            <span className="user-name" title={user.displayName}>{user.displayName}</span>
            <button
              className="btn btn-secondary btn-sm btn-danger"
              onClick={logout}
              title="Sign Out"
              style={{ padding: "0.38rem 0.6rem" }}
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={loginWithGoogle}>
            <LogIn size={13} />
            Sign In
          </button>
        )}
      </div>

      {/* Mobile drawer backdrop */}
      <div className={`nav-drawer-backdrop ${drawerOpen ? "open" : ""}`} onClick={closeDrawer} />

      {/* Mobile drawer */}
      <nav className={`nav-drawer ${drawerOpen ? "open" : ""}`} aria-label="Mobile navigation">
        <button className="nav-drawer-close" onClick={closeDrawer} aria-label="Close menu">
          <X size={20} />
        </button>

        <div className="nav-drawer-tabs">
          <button className={`nav-drawer-tab ${activeTab === "scan" ? "active" : ""}`} onClick={() => handleNav("scan")}>
            <MessageSquareWarning size={16} />
            Scanner
          </button>

          {user && (
            <>
              <button className={`nav-drawer-tab ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => handleNav("dashboard")}>
                <LayoutDashboard size={16} />
                Dashboard
              </button>
              <button className={`nav-drawer-tab ${activeTab === "history" ? "active" : ""}`} onClick={() => handleNav("history")}>
                <History size={16} />
                History
              </button>
            </>
          )}
        </div>

        <hr className="nav-drawer-divider" />

        <div className="nav-drawer-auth">
          {user ? (
            <button className="btn btn-danger btn-sm" onClick={logout} style={{ width: "100%", justifyContent: "center" }}>
              <LogOut size={14} />
              Sign Out
            </button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => { loginWithGoogle(); closeDrawer(); }} style={{ width: "100%", justifyContent: "center" }}>
              <LogIn size={14} />
              Sign In with Google
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}