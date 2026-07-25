import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useMockAuth } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Internal component that uses the useGoogleLogin hook
// (must be inside GoogleOAuthProvider which is set up in main.jsx)
function AuthProviderInner({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Sync user profile to backend (Firebase Firestore via backend)
  // ---------------------------------------------------------------------------
  const syncUserWithBackend = useCallback(async (profile, accessToken) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          photo_url: profile.picture,
        }),
      });
    } catch (err) {
      console.error("Failed to sync user with backend:", err);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Restore session from sessionStorage on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (useMockAuth) {
      const cached = sessionStorage.getItem("scamshield_mock_user");
      if (cached) {
        const parsedUser = JSON.parse(cached);
        const mockToken = `mock_${parsedUser.uid}|${parsedUser.email}|${parsedUser.name}`;
        setUser(parsedUser);
        setToken(mockToken);
        syncUserWithBackend(parsedUser, mockToken);
      }
      setLoading(false);
    } else {
      const cachedUser = sessionStorage.getItem("scamshield_user");
      const cachedToken = sessionStorage.getItem("scamshield_token");
      if (cachedUser && cachedToken) {
        setUser(JSON.parse(cachedUser));
        setToken(cachedToken);
      }
      setLoading(false);
    }
  }, [syncUserWithBackend]);

  // ---------------------------------------------------------------------------
  // Google OAuth login (real) — triggered via useGoogleLogin hook
  // ---------------------------------------------------------------------------
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;

        // Fetch user profile from Google
        const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profile = await res.json();
        // profile contains: id, email, name, picture, given_name, family_name

        const userObj = {
          uid: profile.id,
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          // Keep displayName and photoURL aliases for Navbar compatibility
          displayName: profile.name,
          photoURL: profile.picture,
        };

        setUser(userObj);
        setToken(accessToken);
        sessionStorage.setItem("scamshield_user", JSON.stringify(userObj));
        sessionStorage.setItem("scamshield_token", accessToken);

        await syncUserWithBackend(userObj, accessToken);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch Google user info:", err);
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google Sign-In failed:", err);
      setLoading(false);
    },
  });

  // ---------------------------------------------------------------------------
  // loginWithGoogle — exposed to consumers
  // ---------------------------------------------------------------------------
  const loginWithGoogle = async () => {
    setLoading(true);
    if (useMockAuth) {
      const mockUser = {
        uid: "mock_user_123",
        email: "demo.user@scamshield.local",
        name: "Demo User",
        picture: "https://api.dicebear.com/7.x/bottts/svg?seed=scamshield",
        displayName: "Demo User",
        photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=scamshield",
      };
      const mockToken = `mock_${mockUser.uid}|${mockUser.email}|${mockUser.name}`;
      sessionStorage.setItem("scamshield_mock_user", JSON.stringify(mockUser));
      setUser(mockUser);
      setToken(mockToken);
      await syncUserWithBackend(mockUser, mockToken);
      setLoading(false);
      return mockUser;
    } else {
      // Triggers the Google OAuth popup
      googleLogin();
    }
  };

  // ---------------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------------
  const logout = () => {
    setUser(null);
    setToken(null);
    if (useMockAuth) {
      sessionStorage.removeItem("scamshield_mock_user");
    } else {
      sessionStorage.removeItem("scamshield_user");
      sessionStorage.removeItem("scamshield_token");
    }
  };

  // ---------------------------------------------------------------------------
  // getToken — used by App.jsx for scan API calls
  // ---------------------------------------------------------------------------
  const getToken = useCallback(async () => {
    return token || null;
  }, [token]);

  const value = {
    user,
    loading,
    loginWithGoogle,
    logout,
    getToken,
    isMock: useMockAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const AuthProvider = ({ children }) => {
  return <AuthProviderInner>{children}</AuthProviderInner>;
};
