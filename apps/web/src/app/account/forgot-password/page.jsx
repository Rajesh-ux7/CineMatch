"use client";
import { useState } from "react";
import { Film, Loader2, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reset email");
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Logo */}
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

          {!success ? (
            <>
              <h1
                className="text-2xl font-semibold text-white mb-1"
                style={{ letterSpacing: "-0.03em" }}
              >
                Reset your password
              </h1>
              <p className="text-sm text-gray-500 text-center">
                Enter your email and we'll send you a reset link
              </p>
            </>
          ) : (
            <>
              <div
                className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                style={{
                  backgroundColor: "rgba(37,99,235,0.1)",
                  border: "1px solid rgba(37,99,235,0.2)",
                }}
              >
                <Mail size={24} color="#2563EB" />
              </div>
              <h1
                className="text-2xl font-semibold text-white mb-1"
                style={{ letterSpacing: "-0.03em" }}
              >
                Check your inbox
              </h1>
              <p className="text-sm text-gray-500 text-center">
                We sent a reset link to{" "}
                <span className="text-gray-300">{email}</span>
              </p>
            </>
          )}
        </div>

        {!success ? (
          <div
            className="rounded-2xl p-6"
            style={{ backgroundColor: "#141414", border: "1px solid #2A2A2A" }}
          >
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600"
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
                    <Loader2 size={15} className="animate-spin" /> Sending…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ backgroundColor: "#141414", border: "1px solid #2A2A2A" }}
          >
            <p className="text-sm text-gray-400 mb-4">
              Didn't receive it? Check your spam folder or try again.
            </p>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors duration-100"
              style={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #2A2A2A",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = "#3A3A3A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "#2A2A2A")
              }
            >
              Try another email
            </button>
          </div>
        )}

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
      </div>
    </div>
  );
}
