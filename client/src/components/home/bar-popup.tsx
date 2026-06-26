import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@assets/CF59A14F-4807-4B1E-88AE-7ECF96E43F4F_1776102133381.PNG";

// ─── Google GIS helpers ──────────────────────────────────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (r: { credential: string }) => void; context?: string }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ?? "";

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

// ─── Question config ─────────────────────────────────────────────────────────

type BarVariant = "home" | "tech";

const HOME_QUESTIONS = [
  {
    key: "routes",
    label: "Routes per week?",
    options: ["1–5", "6–15", "16+"],
  },
  {
    key: "challenge",
    label: "Biggest challenge?",
    options: ["Scheduling", "Invoicing", "Growth"],
  },
] as const;

const TECH_QUESTIONS = [
  {
    key: "role",
    label: "Your role?",
    options: ["Field Tech", "Owner", "Office"],
  },
  {
    key: "tracking",
    label: "Job tracking today?",
    options: ["Paper", "Spreadsheet", "App"],
  },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

interface BarPopupProps {
  variant?: BarVariant;
}

export function BarPopup({ variant = "home" }: BarPopupProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [googleReady, setGoogleReady] = useState(false);

  const storageKey = variant === "tech" ? "pf_bar_tech_dismissed" : "pf_bar_dismissed";
  const questions = variant === "tech" ? TECH_QUESTIONS : HOME_QUESTIONS;

  // Load Google GIS
  useEffect(() => {
    loadGoogleScript().then(() => {
      if (window.google && GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          context: "signup",
        });
        setGoogleReady(true);
      }
    });
  }, []);

  // Show after 1.8 s unless already dismissed this session
  useEffect(() => {
    if (sessionStorage.getItem(storageKey)) return;
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, [storageKey]);

  const handleGoogleCredential = useCallback((response: { credential: string }) => {
    // Send ID token to server
    fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: response.credential, answers }),
    })
      .then((r) => r.json())
      .then(() => {
        // Hand off to the real app onboarding; carries popup data along.
        window.location.href = "/onboarding";
      })
      .catch(() => {
        window.location.href = "/onboarding";
      });
  }, [answers]);

  const handleGoogleClick = () => {
    if (googleReady && window.google) {
      window.google.accounts.id.prompt();
    } else {
      // No client ID yet — fall through to the real app sign-in.
      window.location.href = "https://app.pestflow.org/login";
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(storageKey, "1");
    setTimeout(() => setVisible(false), 300);
  };

  const handleAnswer = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    // Persist answers for server submission
    try {
      fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "bar_answer", variant, [key]: value }),
        keepalive: true,
      }).catch(() => {});
    } catch { /* ignore */ }
  };

  const headlineCopy =
    variant === "tech"
      ? "PestFlow for Technicians — free forever"
      : "Run tighter routes. Get paid faster.";

  const ctaPrimary =
    variant === "tech" ? "Create Free Account" : "Start Free Trial";

  const ctaPrimaryHref =
    variant === "tech" ? "https://app.pestflow.org/mobile/tech-signup" : "/onboarding";

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          key="bar-popup"
          initial={{ y: "110%", opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "110%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{ filter: "drop-shadow(0 -4px 24px rgba(0,0,0,0.35))" }}
        >
          <div className="bg-[#0d1117] border-t border-white/10 px-4 py-3 sm:px-6 sm:py-4">
            {/* ── Row 1: Brand + headline + dismiss ── */}
            <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={logoImage}
                  alt="PestFlow"
                  className="h-7 w-auto object-contain shrink-0 hidden sm:block"
                />
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="text-sm sm:text-base font-semibold text-white truncate">
                    {headlineCopy}
                  </span>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Google sign-in */}
                <button
                  onClick={handleGoogleClick}
                  className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-white hover:bg-gray-100 transition-colors text-[13px] font-medium text-gray-700"
                >
                  <GoogleIcon />
                  <span>Google</span>
                </button>

                {/* Primary CTA */}
                <a
                  href={ctaPrimaryHref}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors text-[13px] font-semibold text-white"
                >
                  {ctaPrimary}
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>

                {/* Login link */}
                <a
                  href="/login"
                  className="hidden md:block text-[13px] font-medium text-slate-400 hover:text-white transition-colors px-2"
                >
                  Sign in
                </a>

                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors ml-1"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Row 2: Quick questions ── */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-6 gap-y-2 max-w-5xl mx-auto">
              {questions.map((q) => (
                <div key={q.key} className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 shrink-0">{q.label}</span>
                  <div className="flex items-center gap-1">
                    {q.options.map((opt) => {
                      const selected = answers[q.key] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(q.key, opt)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                            selected
                              ? "bg-emerald-600 border-emerald-500 text-white"
                              : "bg-white/5 border-white/10 text-slate-300 hover:border-emerald-500/50 hover:text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Mobile Google button */}
              <button
                onClick={handleGoogleClick}
                className="flex sm:hidden items-center gap-1.5 h-7 px-3 rounded-lg bg-white hover:bg-gray-100 transition-colors text-[11px] font-medium text-gray-700 ml-auto"
              >
                <GoogleIcon size={14} />
                Continue with Google
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Google SVG icon ─────────────────────────────────────────────────────────

function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
