"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";

import { useAuth } from "@/lib/auth-context";
import { formatErrorMessage } from "@/lib/api";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emailError = touched && !emailRe.test(email) ? "Enter a valid email address" : undefined;
  const passwordError = touched && password.length < 6 ? "Password must be at least 6 characters" : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setErrorMsg(null);

    if (!emailRe.test(email) || password.length < 6) return;
    setLoading(true);

    try {
      await login(email, password);
      setSuccess(true);
    } catch (err: any) {
      console.warn("Backend login failed:", err);
      setErrorMsg(formatErrorMessage(err, "Failed to log in. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="login">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        Log in to keep your pipeline moving.
      </p>

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <FormField
          label="Email address"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          valid={touched && emailRe.test(email)}
          autoComplete="email"
        />
        <FormField
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          valid={touched && password.length >= 6}
          isPassword
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-ink-soft">
            <input type="checkbox" className="h-4 w-4 rounded border-border text-accent-500 focus:ring-accent-300" />
            Remember me
          </label>
          <a href="#" className="font-medium text-accent-600 hover:text-accent-700">
            Forgot password?
          </a>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="btn-accent w-full py-3 text-[15px]"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Logging in…
            </>
          ) : success ? (
            "Welcome back!"
          ) : (
            <>
              Log in <ArrowRight size={16} />
            </>
          )}
        </motion.button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-ink-muted">or continue with</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="btn-outline py-2.5 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.64v3.02h3.87c2.27-2.09 3.58-5.17 3.58-8.85z"/><path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.87-3.02c-1.07.72-2.45 1.15-4.08 1.15-3.13 0-5.79-2.12-6.74-4.96H1.27v3.12A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.26 14.27a7.2 7.2 0 0 1 0-4.6V6.55H1.27a12 12 0 0 0 0 10.9l3.99-3.18z"/><path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.55l3.99 3.12C6.21 6.89 8.87 4.77 12 4.77z"/></svg>
          Google
        </button>
        <button className="btn-outline py-2.5 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1.43c0 1.14-.42 2.15-1.24 3.04-.99 1.06-2.24 1.68-3.57 1.57-.13-1.13.41-2.32 1.15-3.12.85-.93 2.29-1.6 3.66-1.49zm2.9 17.13c-.6 1.37-.88 1.98-1.65 3.2-1.06 1.7-2.55 3.82-4.4 3.84-1.64.02-2.06-1.06-4.28-1.05-2.22.01-2.68 1.07-4.32 1.05-1.85-.02-3.26-1.94-4.32-3.63-2.98-4.65-3.29-10.1-1.45-13 1.31-2.08 3.37-3.3 5.31-3.3 1.97 0 3.21 1.08 4.84 1.08 1.58 0 2.55-1.08 4.83-1.08 1.73 0 3.56.94 4.86 2.57-4.27 2.34-3.58 8.44.58 10.32z"/></svg>
          Apple
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Don&rsquo;t have an account?{" "}
        <Link href="/signup" className="font-medium text-accent-600 hover:text-accent-700">
          Start a free trial
        </Link>
      </p>
    </AuthLayout>
  );
}
