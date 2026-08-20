"use client";

import { useState, FormEvent, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Check } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import FormField from "@/components/auth/FormField";
import { cn } from "@/lib/utils";

import { useAuth } from "@/lib/auth-context";
import { formatErrorMessage } from "@/lib/api";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const rules = useMemo(
    () => [
      { label: "At least 8 characters", valid: password.length >= 8 },
      { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
      { label: "One number", valid: /[0-9]/.test(password) },
    ],
    [password]
  );
  const passwordValid = rules.every((r) => r.valid);

  const nameError = touched && fullName.trim().length < 2 ? "Enter your full name" : undefined;
  const emailError = touched && !emailRe.test(email) ? "Enter a valid email address" : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setErrorMsg(null);

    if (fullName.trim().length < 2 || !emailRe.test(email) || !passwordValid) return;
    setLoading(true);

    try {
      await register(fullName, email, password);
      setSuccess(true);
    } catch (err: any) {
      console.warn("Backend registration failed:", err);
      setErrorMsg(formatErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout mode="signup">
      <h1 className="text-2xl font-bold tracking-tight text-ink">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-muted">
        14-day free trial. No credit card required.
      </p>

      {errorMsg && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <FormField
          label="Full name"
          type="text"
          placeholder="Alex Rivera"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={nameError}
          valid={touched && fullName.trim().length >= 2}
          autoComplete="name"
        />
        <FormField
          label="Work email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          valid={touched && emailRe.test(email)}
          autoComplete="email"
        />
        <div>
          <FormField
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={touched && !passwordValid ? "Password doesn't meet requirements" : undefined}
            valid={touched && passwordValid}
            isPassword
            autoComplete="new-password"
          />
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
            {rules.map((rule) => (
              <span
                key={rule.label}
                className={cn(
                  "flex items-center gap-1.5 text-[11.5px] transition-colors",
                  rule.valid ? "text-success" : "text-ink-muted"
                )}
              >
                <Check
                  size={12}
                  className={cn(
                    "rounded-full transition-colors",
                    rule.valid ? "text-success" : "text-border-strong"
                  )}
                />
                {rule.label}
              </span>
            ))}
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.98 }}
          className="btn-accent w-full py-3 text-[15px]"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Creating account…
            </>
          ) : success ? (
            "Account created!"
          ) : (
            <>
              Start free trial <ArrowRight size={16} />
            </>
          )}
        </motion.button>

        <p className="text-center text-[11.5px] leading-relaxed text-ink-muted">
          By signing up, you agree to our{" "}
          <a href="#" className="underline hover:text-ink">Terms of Service</a> and{" "}
          <a href="#" className="underline hover:text-ink">Privacy Policy</a>.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-600 hover:text-accent-700">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
