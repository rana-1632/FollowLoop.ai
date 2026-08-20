"use client";

import { useState, InputHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  valid?: boolean;
  isPassword?: boolean;
}

export default function FormField({
  label,
  error,
  valid,
  isPassword,
  className,
  ...props
}: FieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="w-full">
      <label className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={isPassword ? (show ? "text" : "password") : props.type}
          className={cn(
            "input-field pr-10",
            error && "border-danger focus:border-danger focus:ring-rose-100",
            valid && !error && "border-success focus:border-success focus:ring-emerald-100",
            className
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((v) => !v)}
              className="text-ink-muted transition-colors hover:text-ink"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : valid && !error ? (
            <CheckCircle2 size={16} className="text-success" />
          ) : error ? (
            <AlertCircle size={16} className="text-danger" />
          ) : null}
        </div>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 text-xs font-medium text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
