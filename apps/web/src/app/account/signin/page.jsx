"use client";
import { useState } from "react";
import { Film, Eye, EyeOff, Loader2 } from "lucide-react";
import useAuth from "@/utils/useAuth";

export default function SignInPage() {
  const { signInWithCredentials } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      const map = {
        CredentialsSignin:
          "Incorrect email or password. Try again or reset your password.",
        AccessDenied: "You don't have permission to sign in.",
        Configuration:
          "Sign-in is unavailable right now. Please try again later.",
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
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to access your personal library
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#141414", border: "1px solid #2A2A2A" }}
        >
          <form onSubmit={onSubmit} noValidate className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-400">
                  Password
                </label>
                <a
                  href="/account/forgot-password"
                  className="text-xs"
                  style={{ color: "#2563EB", textDecoration: "none" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#60A5FA")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#2563EB")
                  }
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
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
                  <Loader2 size={15} className="animate-spin" /> Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{" "}
          <a
            href="/account/signup"
            className="font-medium transition-colors duration-100"
            style={{ color: "#2563EB", textDecoration: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#60A5FA")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#2563EB")}
          >
            Sign up free
          </a>
        </p>
      </div>
    </div>
  );
}
