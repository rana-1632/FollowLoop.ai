"use client";

import { useState, useEffect } from "react";
import {
  User,
  Building,
  Calendar,
  Sparkles,
  Edit3,
  Check,
  Mail,
  Quote,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { AiParseResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ExtractedContactCardProps {
  parsedData: AiParseResponse;
  onUpdateMetadata?: (updated: {
    name: string;
    company: string;
    email: string;
    date: string;
    channel: string;
  }) => void;
}

export default function ExtractedContactCard({
  parsedData,
  onUpdateMetadata,
}: ExtractedContactCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const cleanInitialCompany = (rawComp?: string) => {
    if (!rawComp) return "";
    const trimmed = rawComp.replace(/^[\s,]+|[\s,]+$/g, "").trim();
    return trimmed === "," ? "" : trimmed;
  };

  const [name, setName] = useState(parsedData.contact?.name || "Lead Prospect");
  const [company, setCompany] = useState(cleanInitialCompany(parsedData.contact?.company));
  const [email, setEmail] = useState(parsedData.contact?.email || "");
  const [targetDate, setTargetDate] = useState(
    parsedData.suggestedFollowUpDate || new Date().toISOString().split("T")[0]
  );
  const [channel, setChannel] = useState<string>(parsedData.channel || "EMAIL");

  useEffect(() => {
    setName(parsedData.contact?.name || "Lead Prospect");
    setCompany(cleanInitialCompany(parsedData.contact?.company));
    // Only update email if parsedData actually has a non-empty email to avoid overwriting user typing
    if (parsedData.contact?.email) {
      setEmail(parsedData.contact.email);
    }
    setTargetDate(
      parsedData.suggestedFollowUpDate || new Date().toISOString().split("T")[0]
    );
    setChannel(parsedData.channel || "EMAIL");
  }, [parsedData.contact?.name, parsedData.contact?.company, parsedData.suggestedFollowUpDate, parsedData.channel]);

  const updateParent = (
    updatedName: string,
    updatedCompany: string,
    updatedEmail: string,
    updatedDate: string,
    updatedChannel: string
  ) => {
    if (onUpdateMetadata) {
      onUpdateMetadata({
        name: updatedName,
        company: updatedCompany,
        email: updatedEmail,
        date: updatedDate,
        channel: updatedChannel,
      });
    }
  };

  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    updateParent(name, company, newEmail, targetDate, channel);
  };

  const handleSave = () => {
    setIsEditing(false);
    updateParent(name, company, email, targetDate, channel);
  };

  const handleCopyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.warn("Could not copy email:", err);
    }
  };

  const formattedCompany = company && company.trim() && company.trim() !== "," ? company.trim() : null;
  // Strict complete email regex validation (e.g. user@domain.com)
  const isValidCompleteEmail = Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
  const hasPartialEmail = Boolean(email && email.trim().length > 0);

  return (
    <div className="mb-6 rounded-2xl border border-accent-200/80 bg-surface p-5 shadow-soft transition-all">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-600 text-white shadow-soft">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Extracted Lead Profile
            </h3>
            <p className="text-[11px] text-ink-muted">
              AI-parsed contact metadata &amp; sequence parameters
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {parsedData.isFallback ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50/80 px-3 py-1 text-[11px] font-bold text-sky-900 shadow-2xs"
              title="Generated using standard outreach template"
            >
              <FileText size={13} className="text-sky-600" /> Standard Template
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50/80 px-3 py-1 text-[11px] font-bold text-purple-900 shadow-2xs">
              <Sparkles size={13} className="text-purple-600" /> Smart AI Draft
            </span>
          )}

          {isValidCompleteEmail ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-800 shadow-2xs">
              <CheckCircle2 size={13} className="text-emerald-600" /> Email Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-800 animate-pulse shadow-2xs">
              <AlertTriangle size={13} className="text-amber-600" /> {hasPartialEmail ? "Incomplete Email" : "Email Required"}
            </span>
          )}
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-surface-muted hover:text-ink transition-colors shadow-2xs"
          >
            {isEditing ? (
              <>
                <Check size={13} className="text-emerald-600" /> Save Details
              </>
            ) : (
              <>
                <Edit3 size={13} /> Edit Lead Details
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Recipient Email Direct Input Card - STABLE MOUNT (Never unmounts mid-typing) */}
      {!isEditing && (
        <div
          className={cn(
            "mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-3.5 sm:p-4 text-xs transition-all border shadow-2xs overflow-hidden",
            isValidCompleteEmail
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-amber-300 bg-amber-50/90"
          )}
        >
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-2xs transition-colors mt-0.5 sm:mt-0",
                isValidCompleteEmail ? "bg-emerald-600" : "bg-amber-500"
              )}
            >
              <Mail size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p
                  className={cn(
                    "font-extrabold text-xs sm:text-sm leading-snug break-words",
                    isValidCompleteEmail ? "text-emerald-950" : "text-amber-950"
                  )}
                >
                  {isValidCompleteEmail
                    ? "Target Recipient Email"
                    : "Action Required: Enter Target Email Address"}
                </p>
                {isValidCompleteEmail && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    Ready
                  </span>
                )}
              </div>
              <p className={cn("text-[11px] leading-tight mt-0.5 break-words", isValidCompleteEmail ? "text-emerald-800" : "text-amber-800")}>
                {isValidCompleteEmail
                  ? "Automated follow-up emails will be dispatched to this recipient."
                  : "Provide recipient email so automated sequence emails can be dispatched."}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0 sm:flex-1 max-w-sm">
            <input
              type="email"
              placeholder="e.g. lead.contact@company.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={cn(
                "input-field py-2 text-xs font-bold bg-white transition-all shadow-xs w-full",
                isValidCompleteEmail
                  ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200 text-emerald-950 font-mono"
                  : "border-amber-300 focus:border-accent-500 focus:ring-amber-200 text-amber-950"
              )}
            />
          </div>
        </div>
      )}

      {/* Editing Mode */}
      {isEditing ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
          <div>
            <label className="mb-1 block font-semibold text-ink-soft">Contact Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field py-2 text-xs font-medium"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-ink-soft">Company / Venue</label>
            <input
              type="text"
              placeholder="e.g. Acme Corp or Independent"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="input-field py-2 text-xs font-medium"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-ink-soft">Target Recipient Email</label>
            <input
              type="email"
              placeholder="e.g. lead@company.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="input-field py-2 text-xs font-medium font-mono"
            />
          </div>

          <div>
            <label className="mb-1 block font-semibold text-ink-soft">Target Follow-Up Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input-field py-2 text-xs font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block font-semibold text-ink-soft">Outreach Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="input-field py-2 text-xs font-medium bg-surface"
            >
              <option value="EMAIL">EMAIL</option>
              <option value="LINKEDIN">LINKEDIN</option>
              <option value="WHATSAPP">WHATSAPP</option>
            </select>
          </div>
        </div>
      ) : (
        /* Viewing Mode: 2-Column Horizontal Cards */
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Contact Name */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/40 p-3.5 transition-colors hover:border-accent-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 border border-accent-100">
              <User size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Contact Name
              </p>
              <p className="truncate text-xs sm:text-sm font-bold text-ink" title={name}>
                {name}
              </p>
            </div>
          </div>

          {/* Company / Venue */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/40 p-3.5 transition-colors hover:border-accent-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Building size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Company / Venue
              </p>
              <p className="truncate text-xs sm:text-sm font-bold text-ink" title={formattedCompany || "Independent / Unspecified"}>
                {formattedCompany || "Independent / Unspecified"}
              </p>
            </div>
          </div>

          {/* Target Recipient Email Card */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/40 p-3.5 transition-colors hover:border-accent-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Mail size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Recipient Email
                </p>
                {isValidCompleteEmail && (
                  <button
                    onClick={handleCopyEmail}
                    className="text-ink-muted hover:text-accent-600 transition-colors p-0.5 rounded"
                    title="Copy Email"
                  >
                    {copiedEmail ? <CheckCircle2 size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
              <p className="truncate text-xs sm:text-sm font-bold text-accent-700 font-mono" title={email || "Click Edit to add recipient email"}>
                {isValidCompleteEmail ? email : email ? email : "⚠️ Add Email Address"}
              </p>
            </div>
          </div>

          {/* Target Follow-Up Date */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/40 p-3.5 transition-colors hover:border-accent-200">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Calendar size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Target Follow-Up
                </p>
                <span className="rounded bg-accent-50 text-accent-700 px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase border border-accent-100/80">
                  {channel}
                </span>
              </div>
              <p className="truncate text-xs sm:text-sm font-bold text-emerald-800">
                {targetDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Context & Intent Summary */}
      {parsedData.summary && (
        <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50/50 p-3.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700">
              <Quote size={11} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
              AI Context &amp; Intent Summary
            </span>
          </div>
          <p className="text-xs leading-relaxed text-ink-soft font-medium pl-0.5">
            {parsedData.summary}
          </p>
        </div>
      )}
    </div>
  );
}
