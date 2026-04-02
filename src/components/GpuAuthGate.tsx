"use client";

import { useState, useEffect } from "react";

const TOKEN_KEY = "gpu_auth_token";

export function useGpuAuth() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsChecking(false);
      return;
    }
    // Verify stored token is still valid
    fetch("/api/auth/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        setIsAuthorized(data.valid === true);
        if (!data.valid) localStorage.removeItem(TOKEN_KEY);
      })
      .catch(() => {
        // If auth endpoint doesn't exist (local mode), assume authorized
        setIsAuthorized(true);
      })
      .finally(() => setIsChecking(false));
  }, []);

  const authorize = async (password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.authorized) {
        if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
        setIsAuthorized(true);
        return { ok: true };
      }
      return { ok: false, error: data.error || "Invalid password." };
    } catch {
      // Auth endpoint not available — local mode, allow through
      setIsAuthorized(true);
      return { ok: true };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setIsAuthorized(false);
  };

  return { isAuthorized, isChecking, authorize, logout };
}

interface GpuAuthGateProps {
  children: React.ReactNode;
}

export default function GpuAuthGate({ children }: GpuAuthGateProps) {
  const { isAuthorized, isChecking, authorize } = useGpuAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isChecking) {
    return (
      <div className="gpu-auth-gate">
        <div className="gpu-auth-card">
          <p>Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const result = await authorize(password);
    if (!result.ok) {
      setError(result.error || "Invalid password.");
    }
    setSubmitting(false);
  };

  return (
    <div className="gpu-auth-gate">
      <div className="gpu-auth-card">
        <h2>🔒 GPU Access Required</h2>
        <p>Enter the password to use this tool.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="gpu-auth-input"
            autoFocus
            disabled={submitting}
          />
          <button type="submit" className="gpu-auth-button" disabled={submitting || !password}>
            {submitting ? "Verifying..." : "Unlock"}
          </button>
        </form>
        {error && <p className="gpu-auth-error">{error}</p>}
      </div>
    </div>
  );
}
