"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "forgot";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (!signInError) {
      router.push("/dashboard");
      router.refresh();
      return;
    }
    setError(signInError.message);
    setLoading(false);
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://keala.io/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess("Check your email for a password reset link.");
    }
    setLoading(false);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setSuccess("");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Branding panel — hidden on mobile */}
      <div className="auth-panel">
        <div className="auth-panel-grid" />
        <div className="auth-panel-glow" />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Image
            src="/KealaLogo.png"
            alt="Keala Advisors"
            width={110}
            height={40}
            style={{ objectFit: "contain" }}
          />
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{
            fontSize: "1.65rem",
            fontWeight: 700,
            color: "#e8e6e1",
            lineHeight: 1.3,
            letterSpacing: "-0.02em",
            marginBottom: "0.85rem",
          }}>
            Your client<br />intelligence hub
          </p>
          <p style={{ fontSize: "0.875rem", color: "#4b5563", lineHeight: 1.7 }}>
            Manage financial plans, proposals, and client relationships — all in one secure portal.
          </p>
        </div>

        <p style={{ position: "relative", zIndex: 1, fontSize: "0.7rem", color: "#2d3748", letterSpacing: "0.04em" }}>
          © {new Date().getFullYear()} Keala Advisors. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1.5rem",
      }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* Mobile-only logo */}
          <div className="auth-mobile-logo">
            <Image
              src="/KealaLogo.png"
              alt="Keala Advisors"
              width={110}
              height={40}
              style={{ objectFit: "contain" }}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#f0eeea",
              letterSpacing: "-0.02em",
              marginBottom: "0.35rem",
            }}>
              {mode === "signin" ? "Welcome back" : "Reset your password"}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {mode === "signin"
                ? "Sign in to your Keala account"
                : "We'll send a reset link to your email"}
            </p>
          </div>

          {resetSuccess && (
            <Banner variant="success" message="Password updated successfully. Please sign in." />
          )}

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@keala.io"
                  style={inputStyle}
                  className="auth-input"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    style={{ fontSize: "0.75rem", color: "#575ECF", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: "2.8rem" }}
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: "absolute", right: "0.8rem", top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#6b7280", display: "flex", alignItems: "center", padding: 0,
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <Banner variant="error" message={error} />}

              <button type="submit" disabled={loading} style={btnStyle(loading)} className="auth-btn">
                {loading && <Spinner />}
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@keala.io"
                  style={inputStyle}
                  className="auth-input"
                />
              </div>

              {error && <Banner variant="error" message={error} />}
              {success && <Banner variant="success" message={success} />}

              <button type="submit" disabled={loading} style={btnStyle(loading)} className="auth-btn">
                {loading && <Spinner />}
                {loading ? "Sending…" : "Send reset link"}
              </button>

              <button
                type="button"
                onClick={() => switchMode("signin")}
                style={{
                  fontSize: "0.8rem", color: "#6b7280",
                  background: "none", border: "none",
                  cursor: "pointer", textAlign: "center",
                }}
              >
                ← Back to sign in
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.8rem", color: "#6b7280" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#575ECF", textDecoration: "none", fontWeight: 600 }}>
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Banner({ variant, message }: { variant: "success" | "error"; message: string }) {
  const isSuccess = variant === "success";
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "0.6rem",
      fontSize: "0.8rem",
      color: isSuccess ? "#6fcf97" : "#f87171",
      background: isSuccess ? "rgba(111,207,151,0.08)" : "rgba(248,113,113,0.08)",
      border: `1px solid ${isSuccess ? "rgba(111,207,151,0.2)" : "rgba(248,113,113,0.2)"}`,
      borderRadius: 8,
      padding: "0.75rem 1rem",
    }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{isSuccess ? "✓" : "⚠"}</span>
      <span>{message}</span>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: 13, height: 13,
      border: "2px solid rgba(255,255,255,0.25)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      marginRight: "0.5rem",
      flexShrink: 0,
    }} />
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  color: "#9ca3af",
  marginBottom: "0.4rem",
  fontWeight: 500,
  letterSpacing: "0.01em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8,
  padding: "0.72rem 0.9rem",
  color: "#e5e3df",
  fontSize: "0.9rem",
  fontFamily: "var(--font-body)",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  boxSizing: "border-box",
};

const btnStyle = (loading: boolean): React.CSSProperties => ({
  width: "100%",
  background: loading ? "rgba(87,94,207,0.5)" : "#575ECF",
  color: loading ? "rgba(255,255,255,0.45)" : "#fff",
  border: "none",
  borderRadius: 8,
  padding: "0.78rem",
  fontSize: "0.9rem",
  fontWeight: 600,
  fontFamily: "var(--font-body)",
  cursor: loading ? "not-allowed" : "pointer",
  transition: "background 0.15s, box-shadow 0.15s",
  letterSpacing: "0.01em",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});
