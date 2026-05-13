import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

// ─── Google GIS helpers ──────────────────────────────────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (r: { credential: string }) => void;
            context?: string;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = "65383864801-kd754q4cjeep88638fus0e48kib9s4ts.apps.googleusercontent.com";

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById("pf-gsi")) { resolve(); return; }
    const s = document.createElement("script");
    s.id = "pf-gsi";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleCredential = useCallback(async (response: { credential: string }) => {
    setGoogleLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });
      if (r.ok) {
        window.location.href = "/dashboard";
      } else {
        const d = await r.json();
        setError(d.message ?? "Google sign-in failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoogleScript().then(() => {
      if (window.google && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          context: "signin",
        });
      }
    });
  }, [handleGoogleCredential]);

  const handleGoogleClick = () => {
    const w = window as any;
    if (!w.google?.accounts?.oauth2) {
      setError("Google sign-in not available yet. Please refresh the page.");
      return;
    }
    setGoogleLoading(true);
    setError("");
    const tokenClient = w.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "openid email profile",
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          setGoogleLoading(false);
          setError("Sign-in cancelled.");
          return;
        }
        try {
          const r = await fetch("/api/auth/google-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: tokenResponse.access_token }),
          });
          if (r.ok) {
            window.location.href = "/dashboard";
          } else {
            const d = await r.json().catch(() => ({}));
            setError(d.message ?? "Sign-in failed. Please try again.");
            setGoogleLoading(false);
          }
        } catch {
          setError("Network error. Please check your connection and try again.");
          setGoogleLoading(false);
        }
      },
    });
    tokenClient.requestAccessToken({ prompt: "select_account" });
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (r.ok) {
        window.location.href = "/dashboard";
      } else {
        const d = await r.json();
        setError(d.message ?? "Invalid email or password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <img src={logoImage} alt="PestFlow" className="h-14 w-auto object-contain cursor-pointer" />
          </Link>
        </div>

        <div className="bg-[#161b22] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-1 text-center">Welcome back</h1>
          <p className="text-sm text-slate-400 text-center mb-7">
            Sign in to your PestFlow account
          </p>

          {/* Google button */}
          <button
            onClick={handleGoogleClick}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-white hover:bg-gray-100 active:bg-gray-200 transition-colors text-sm font-semibold text-gray-800 shadow-sm mb-5 disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Email address
              </label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500 h-10"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400">Password</label>
                <a
                  href="/forgot-password"
                  className="text-[11px] text-slate-500 hover:text-emerald-400 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500 h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl mt-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
        </div>

        {/* Footer links */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link href="/create-account" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Start free trial
          </Link>
        </p>
        <p className="text-center text-xs text-slate-600 mt-3">
          <Link href="/" className="hover:text-slate-400 transition-colors">
            ← Back to pestflow.org
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

// ─── Google SVG icon ─────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
