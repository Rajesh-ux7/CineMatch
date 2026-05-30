"use client";
import { useState } from "react";
import { Film, Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import useAuth from "@/utils/useAuth";

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

export default function SignUpPage() {
  const { signUpWithCredentials } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const passwordValid =
    password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!passwordValid) {
      setError(
        "Password must be at least 8 characters with a letter and a number.",
      );
      return;
    }

    setLoading(true);
    try {
      await signUpWithCredentials({
        email,
        password,
        name: name.trim() || undefined,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const map = {
        CredentialsSignin:
          "This email is already registered. Try signing in instead.",
        EmailCreateAccount: "This email is already in use.",
        AccessDenied: "You don't have permission to sign up.",
      };
      setError(map[err?.message] || "Something went wrong. Please try again.");
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
      {/* Background glow */}
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
          <h1
            className="text-2xl font-semibold text-white mb-1"
            style={{ letterSpacing: "-0.03em" }}
          >
            Create your account
          </h1>
          <p className="text-sm text-gray-500">
            Get personalized recommendations & save your watchlist
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#141414", border: "1px solid #2A2A2A" }}
        >
          <form onSubmit={onSubmit} noValidate className="space-y-4">
            {/* Name (optional) */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Display name <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  outline: "none",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Password
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

            {/* Error */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-colors duration-100"
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
                  <Loader2 size={15} className="animate-spin" /> Creating
                  account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{" "}
          <a
            href="/account/signin"
            className="font-medium transition-colors duration-100"
            style={{ color: "#2563EB", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#60A5FA")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#2563EB")}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
