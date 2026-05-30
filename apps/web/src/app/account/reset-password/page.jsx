"use client";
import { useState, useEffect } from "react";
import { Film, Eye, EyeOff, Loader2, Check, X, ArrowLeft } from "lucide-react";

function PasswordStrength({ password }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains a number", ok: /\d/.test(password) },
    { label: "Contains a letter", ok: /[a-zA-Z]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="space-y-1 mt-2">
      {checks.map((c, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          {c.ok ? (
            <Check size={11} color="#22C55E" />
          ) : (
            <X size={11} color="#6B7280" />
          )}
          <span style={{ color: c.ok ? "#22C55E" : "#6B7280" }}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get("token");
      if (t) setToken(t);
    }
  }, []);

  const passwordValid =
    password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
      return;
    }
    if (!password) {
      setError("Please enter a new password.");
      return;
    }
    if (!passwordValid) {
      setError(
        "Password must be at least 8 characters with a letter and a number.",
      );
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token && typeof window !== "undefined") {
    return (
      <div
        style={{
          backgroundColor: "#0A0A0A",
          minHeight: "100vh",
          fontFamily: '"Inter", sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="text-center">
          <p className="text-base font-semibold text-white mb-2">
            Invalid reset link
          </p>
          <a
            href="/account/forgot-password"
            style={{ color: "#2563EB", textDecoration: "none", fontSize: 14 }}
          >
            Request a new one
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        fontFamily: '"Inter", sans-serif',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div className="relative z-10 w-full" style={{ maxWidth: 420 }}>
        <div className="flex flex-col items-center mb-8">
          <a
            href="/"
            className="flex items-center gap-2.5 mb-6"
            style={{ textDecoration: "none" }}
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              }}
            >
              <Film size={20} color="white" />
            </div>
            <span
              className="text-xl font-semibold text-white"
              style={{ letterSpacing: "-0.03em" }}
            >
              CineMatch <span style={{ color: "#2563EB" }}>AI</span>
            </span>
          </a>
          <h1
            className="text-2xl font-semibold text-white mb-1"
            style={{ letterSpacing: "-0.03em" }}
          >
            {success ? "Password updated!" : "Set new password"}
          </h1>
          <p className="text-sm text-gray-500 text-center">
            {success
              ? "Your password has been reset successfully."
              : "Choose a new secure password for your account"}
          </p>
        </div>

        {success ? (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: "#141414", border: "1px solid #2A2A2A" }}
          >
            <div
              className="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-4"
              style={{
                backgroundColor: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              <Check size={24} color="#22C55E" />
            </div>
            <p className="text-sm text-gray-400 mb-5">
              You can now sign in with your new password.
            </p>
            <a
              href="/account/signin"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-white"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                textDecoration: "none",
              }}
            >
              Sign In Now
            </a>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid #2A2A2A" }}
          >
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-gray-600"
                    style={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2A2A2A",
                      outline: "none",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#2563EB")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#2A2A2A")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6B7280",
                    }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600"
                  style={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2A2A2A",
                    outline: "none",
                    borderColor:
                      confirm && confirm !== password ? "#DC2626" : "",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "#2563EB")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      confirm && confirm !== password ? "#DC2626" : "#2A2A2A")
                  }
                />
                {confirm && confirm !== password && (
                  <p className="text-xs mt-1" style={{ color: "#F87171" }}>
                    Passwords don't match
                  </p>
                )}
              </div>

              {error && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-sm"
                  style={{
                    backgroundColor: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.2)",
                    color: "#F87171",
                  }}
                >
                  <span>⚠</span> <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                style={{
                  background: loading
                    ? "#1E3A8A"
                    : "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: 8,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Updating…
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </div>
        )}

        {!success && (
          <div className="flex justify-center mt-5">
            <a
              href="/account/signin"
              className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors duration-100"
              style={{ textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F9FAFB")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
            >
              <ArrowLeft size={13} /> Back to sign in
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
