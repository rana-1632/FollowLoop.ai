import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Clock,
  GitBranch,
  Trash2,
  Copy,
  Check,
  Edit3,
  Eye,
  Calendar,
  Zap,
  CalendarCheck,
  X,
  AlertTriangle,
} from "lucide-react";
import { cn, toLocalISOString, getMinDateTime, formatDisplayDateTime, formatEmailBodyWithSignature } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export interface SequenceStepData {
  id: string;
  day: number;
  type?: "email" | "wait" | "condition";
  channel?: "EMAIL" | "LINKEDIN" | "WHATSAPP";
  subject: string;
  body: string;
  status?: string;
  condition?: string;
  scheduledDate?: string; // Local format YYYY-MM-DDTHH:mm or ISO string
  delayLabel?: string;
}

function SequenceStep({
  step,
  index,
  totalSteps,
  contactEmail,
  contactName,
  onRemove,
  onUpdateStep,
  onPreviewStep,
}: {
  step: SequenceStepData;
  index: number;
  totalSteps: number;
  contactEmail?: string;
  contactName?: string;
  onRemove: (id: string) => void;
  onUpdateStep: (id: string, updated: Partial<SequenceStepData>) => void;
  onPreviewStep: (step: SequenceStepData) => void;
}) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePickerPopover, setShowDatePickerPopover] = useState(false);
  const [dateSavedFeedback, setDateSavedFeedback] = useState(false);
  const [pastDateError, setPastDateError] = useState<string | null>(null);

  const [subjectInput, setSubjectInput] = useState(step.subject);
  const [bodyInput, setBodyInput] = useState(step.body);
  const [dayInput, setDayInput] = useState(step.day);

  // Initialize local date/time input (defaults to today + step.day at 09:00 local time)
  const getInitialDateTime = () => {
    if (step.scheduledDate) {
      if (step.scheduledDate.includes("T")) {
        return step.scheduledDate.slice(0, 16); // Local format YYYY-MM-DDTHH:mm
      }
      return `${step.scheduledDate}T09:00`;
    }
    const d = new Date(Date.now() + step.day * 86400000);
    return toLocalISOString(d);
  };

  const [dateTimeInput, setDateTimeInput] = useState(getInitialDateTime());
  const [timingLabel, setTimingLabel] = useState(step.delayLabel || `Day ${step.day} Schedule`);

  useEffect(() => {
    setSubjectInput(step.subject);
    setBodyInput(step.body);
    setDayInput(step.day);
    if (step.scheduledDate) {
      setDateTimeInput(
        step.scheduledDate.includes("T")
          ? step.scheduledDate.slice(0, 16)
          : `${step.scheduledDate}T09:00`
      );
    }
    if (step.delayLabel) {
      setTimingLabel(step.delayLabel);
    }
  }, [step.subject, step.body, step.day, step.scheduledDate, step.delayLabel]);

  // Flash Feedback Toast
  const triggerSaveFeedback = () => {
    setDateSavedFeedback(true);
    setTimeout(() => setDateSavedFeedback(false), 2500);
  };

  // Explicit Date & Time Save Action with Validation
  const handleSaveDateTime = (newDateTime?: string, newLabel?: string) => {
    setPastDateError(null);
    const targetDt = newDateTime || dateTimeInput;
    const targetLabel = newLabel || timingLabel;

    // Parse date for past date validation (allowing 2 minutes grace period for current time picks)
    const selectedDateObj = new Date(targetDt);
    const minAllowedTime = Date.now() - 2 * 60 * 1000;

    if (selectedDateObj.getTime() < minAllowedTime) {
      setPastDateError("Cannot schedule a follow-up in the past. Please select a future date and time.");
      return;
    }

    setDateTimeInput(targetDt);
    setTimingLabel(targetLabel);

    // Save exact local format (YYYY-MM-DDTHH:mm) to parent step to prevent timezone shifts
    onUpdateStep(step.id, {
      scheduledDate: targetDt,
      delayLabel: targetLabel,
    });

    triggerSaveFeedback();
    setShowDatePickerPopover(false);
  };

  // Quick Delay Presets
  const applyPresetDelay = (minutes: number, label: string) => {
    const targetDateObj = new Date(Date.now() + minutes * 60 * 1000);
    const localIso = toLocalISOString(targetDateObj);
    handleSaveDateTime(localIso, label);
  };

  const isEmail = step.type === "email" || !step.type;
  const isWait = step.type === "wait";

  const senderName = user?.fullName || "Sales Outreach Team";

  // Formatted Body & Signature (using smart signature formatter)
  const displayBody = formatEmailBodyWithSignature(step.body, senderName);

  // Clean Recipient Header Display
  const recipientDisplay =
    contactName && contactName !== "Lead Contact"
      ? `${contactName} (${contactEmail || "No email set"})`
      : contactEmail || "No recipient email set";

  const handleCopy = async () => {
    const textToCopy = `To: ${recipientDisplay}\nSubject: ${step.subject}\nScheduled: ${formatDisplayDateTime(
      dateTimeInput
    )}\n\n${displayBody}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy text:", err);
    }
  };

  const handleSaveEdit = () => {
    setPastDateError(null);
    const selectedDateObj = new Date(dateTimeInput);
    if (selectedDateObj.getTime() < Date.now() - 2 * 60 * 1000) {
      setPastDateError("Cannot schedule a follow-up in the past. Please select a future date and time.");
      return;
    }

    onUpdateStep(step.id, {
      subject: subjectInput,
      body: bodyInput,
      day: dayInput,
      scheduledDate: dateTimeInput,
      delayLabel: timingLabel,
    });
    triggerSaveFeedback();
    setIsEditing(false);
  };

  const currentMinDateTime = getMinDateTime();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="group relative flex flex-col sm:flex-row gap-3 sm:gap-4"
    >
      {/* Timeline Connector Line */}
      <div className="flex sm:flex-col items-center gap-2 sm:gap-0">
        <div
          className={cn(
            "flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl font-bold text-xs shadow-sm transition-transform group-hover:scale-105",
            isEmail
              ? "bg-accent-600 text-white shadow-accent-600/20"
              : isWait
              ? "bg-amber-500 text-white shadow-amber-500/20"
              : "bg-sky-600 text-white shadow-sky-600/20"
          )}
        >
          {isEmail ? <Mail size={16} className="sm:w-[18px] sm:h-[18px]" /> : isWait ? <Clock size={16} className="sm:w-[18px] sm:h-[18px]" /> : <GitBranch size={16} className="sm:w-[18px] sm:h-[18px]" />}
        </div>
        <span className="sm:hidden text-xs font-bold text-ink">
          Follow-Up #{index + 1}
        </span>
        {index < totalSteps - 1 && (
          <div className="hidden sm:block my-1.5 w-0.5 flex-1 bg-gradient-to-b from-border-strong via-border to-border-strong" />
        )}
      </div>

      {/* Step Card */}
      <div className="mb-4 sm:mb-6 flex-1 rounded-2xl border border-border bg-surface p-3.5 sm:p-5 shadow-soft transition-all group-hover:border-border-strong group-hover:shadow-card min-w-0">
        {/* Top Header Row */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/60 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="hidden sm:inline-flex rounded-full bg-ink text-white px-2.5 py-0.5 text-[11px] font-bold">
              Follow-Up #{index + 1}
            </span>

            {/* Timing Label Badge */}
            <span className="rounded-full bg-accent-50 text-accent-700 px-2.5 py-0.5 text-[11px] font-semibold border border-accent-100">
              {timingLabel}
            </span>

            {/* Interactive Scheduled Date/Time Badge */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatePickerPopover(!showDatePickerPopover)}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 sm:px-3 py-1 text-[10.5px] sm:text-[11px] font-bold transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
                title="Click to open calendar & pick schedule date/time"
              >
                <Calendar size={12} className="text-emerald-600 sm:w-[13px] sm:h-[13px]" />
                <span className="truncate max-w-[140px] sm:max-w-none">{formatDisplayDateTime(dateTimeInput)}</span>
                <span className="text-[9px] sm:text-[9.5px] uppercase font-bold text-emerald-700 underline decoration-dotted">
                  Edit
                </span>
              </button>

              {/* Popover Calendar Picker */}
              <AnimatePresence>
                {showDatePickerPopover && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs sm:hidden"
                      onClick={() => setShowDatePickerPopover(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="fixed inset-x-3 top-1/2 -translate-y-1/2 z-50 max-w-sm ml-auto mr-auto sm:absolute sm:inset-auto sm:left-0 sm:top-9 sm:translate-y-0 sm:w-80 rounded-2xl border border-border bg-surface p-4 shadow-2xl space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <div className="flex items-center gap-1.5">
                          <CalendarCheck size={16} className="text-emerald-600" />
                          <h5 className="text-xs font-bold text-ink">Set Date &amp; Dispatch Time</h5>
                        </div>
                        <button
                          onClick={() => setShowDatePickerPopover(false)}
                          className="rounded-full p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {pastDateError && (
                        <div className="flex items-center gap-1.5 rounded-xl bg-rose-50 p-2 text-[11px] font-semibold text-rose-700 border border-rose-200">
                          <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                          <span>{pastDateError}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-semibold text-ink-soft mb-1">
                          Select Future Date &amp; Time (Min: Now)
                        </label>
                        <input
                          type="datetime-local"
                          min={currentMinDateTime}
                          value={dateTimeInput}
                          onChange={(e) => {
                            setDateTimeInput(e.target.value);
                            setTimingLabel("Custom Timing");
                            setPastDateError(null);
                          }}
                          className="input-field py-2 text-xs font-bold bg-surface border-emerald-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-extrabold uppercase tracking-wider text-ink-muted mb-1.5">
                          Or Pick Quick Preset Delay:
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => applyPresetDelay(15, "15 Mins Delay")}
                            className="rounded-lg border border-border bg-surface-muted/40 p-1.5 text-[11px] font-semibold text-ink hover:bg-accent-50 hover:border-accent-300 hover:text-accent-700 text-left transition-colors cursor-pointer"
                          >
                            ⏱️ 15 Minutes
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPresetDelay(60, "1 Hour Delay")}
                            className="rounded-lg border border-border bg-surface-muted/40 p-1.5 text-[11px] font-semibold text-ink hover:bg-accent-50 hover:border-accent-300 hover:text-accent-700 text-left transition-colors cursor-pointer"
                          >
                            ⏳ 1 Hour
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPresetDelay(1440, "1 Day Delay")}
                            className="rounded-lg border border-border bg-surface-muted/40 p-1.5 text-[11px] font-semibold text-ink hover:bg-accent-50 hover:border-accent-300 hover:text-accent-700 text-left transition-colors cursor-pointer"
                          >
                            📅 1 Day
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPresetDelay(4320, "3 Days Delay")}
                            className="rounded-lg border border-border bg-surface-muted/40 p-1.5 text-[11px] font-semibold text-ink hover:bg-accent-50 hover:border-accent-300 hover:text-accent-700 text-left transition-colors cursor-pointer"
                          >
                            📅 3 Days
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDatePickerPopover(false)}
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveDateTime()}
                          className="btn-accent py-1.5 px-3 text-xs font-bold flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          <Check size={14} /> Apply &amp; Save Schedule
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Saved Toast Feedback */}
            {dateSavedFeedback && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-extrabold shadow-sm"
              >
                <Check size={11} /> Saved &amp; Scheduled!
              </motion.span>
            )}

            {step.channel && (
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-ink-muted uppercase">
                {step.channel}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() =>
                onPreviewStep({
                  ...step,
                  scheduledDate: formatDisplayDateTime(dateTimeInput),
                  body: displayBody,
                })
              }
              className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2 sm:px-2.5 py-1 text-xs font-medium text-ink-soft hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700 transition-colors"
              title="Preview email draft"
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>

            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-2 sm:px-2.5 py-1 text-xs font-medium transition-colors",
                copied
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-border bg-surface text-ink-soft hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700"
              )}
              title="Copy email to clipboard"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-2 sm:px-2.5 py-1 text-xs font-medium transition-colors",
                isEditing
                  ? "border-accent-400 bg-accent-100 text-accent-800"
                  : "border-border bg-surface text-ink-soft hover:border-accent-200 hover:bg-accent-50 hover:text-accent-700"
              )}
              title="Edit scheduled date, timing preset, or email copy"
            >
              <Edit3 size={13} />
              <span>{isEditing ? "Close" : "Edit Step"}</span>
            </button>

            {/* Delete Control */}
            <button
              onClick={() => onRemove(step.id)}
              className="rounded-lg p-1.5 text-ink-muted hover:bg-rose-50 hover:text-rose-600 transition-colors ml-auto sm:ml-1"
              title="Delete this follow-up from sequence"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Target Email "To" Indicator */}
        <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs bg-canvas/60 rounded-xl p-2.5 sm:px-3 sm:py-1.5 border border-border/50">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-ink-muted uppercase text-[10px] tracking-wider shrink-0">To:</span>
            <span className="font-semibold text-accent-700 font-mono truncate">{recipientDisplay}</span>
          </div>
          <span className="text-[10px] sm:text-[10.5px] font-medium text-ink-muted flex items-center gap-1 shrink-0">
            <Zap size={11} className="text-amber-500 shrink-0" /> Auto-dispatched by Cron when due
          </span>
        </div>

        {/* Editing Mode */}
        {isEditing ? (
          <div className="space-y-4 pt-1">
            {/* Quick Delay Presets Control Bar */}
            <div className="rounded-xl border border-accent-200/80 bg-accent-50/40 p-3">
              <label className="mb-1.5 block text-xs font-extrabold text-accent-950 flex items-center gap-1.5">
                <Clock size={13} className="text-accent-600" />
                Customize Outreach Timing &amp; Delay Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetDelay(15, "15 Mins Delay")}
                  className="rounded-lg border border-accent-200 bg-white px-2.5 py-1 text-xs font-bold text-accent-800 hover:bg-accent-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  ⏱️ 15 Mins
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDelay(30, "30 Mins Delay")}
                  className="rounded-lg border border-accent-200 bg-white px-2.5 py-1 text-xs font-bold text-accent-800 hover:bg-accent-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  ⏱️ 30 Mins
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDelay(60, "1 Hour Delay")}
                  className="rounded-lg border border-accent-200 bg-white px-2.5 py-1 text-xs font-bold text-accent-800 hover:bg-accent-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  ⏳ 1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDelay(120, "2 Hours Delay")}
                  className="rounded-lg border border-accent-200 bg-white px-2.5 py-1 text-xs font-bold text-accent-800 hover:bg-accent-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  ⏳ 2 Hours
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDelay(1440, "1 Day Delay")}
                  className="rounded-lg border border-accent-200 bg-white px-2.5 py-1 text-xs font-bold text-accent-800 hover:bg-accent-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  📅 1 Day
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDelay(4320, "3 Days Delay")}
                  className="rounded-lg border border-accent-200 bg-white px-2.5 py-1 text-xs font-bold text-accent-800 hover:bg-accent-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  📅 3 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetDelay(10080, "7 Days Delay")}
                  className="rounded-lg border border-accent-200 bg-white px-2.5 py-1 text-xs font-bold text-accent-800 hover:bg-accent-600 hover:text-white transition-colors shadow-2xs cursor-pointer"
                >
                  📅 7 Days
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-soft">Subject Line</label>
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="input-field py-2 text-xs font-semibold"
                />
              </div>

              {/* Precise Date & Time Picker */}
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Calendar size={14} className="text-emerald-600" /> Custom Scheduled Date &amp; Dispatch Time
                  </label>
                  {dateSavedFeedback && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Check size={10} /> Saved &amp; Scheduled!
                    </span>
                  )}
                </div>

                {pastDateError && (
                  <div className="mb-2 flex items-center gap-1.5 rounded-xl bg-rose-50 p-2 text-[11px] font-semibold text-rose-700 border border-rose-200">
                    <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                    <span>{pastDateError}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="datetime-local"
                      min={currentMinDateTime}
                      value={dateTimeInput}
                      onChange={(e) => {
                        setDateTimeInput(e.target.value);
                        setTimingLabel("Custom Timing");
                        setPastDateError(null);
                      }}
                      className="input-field py-2 text-xs font-bold bg-white border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSaveDateTime()}
                    className="btn-accent px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                    title="Apply & Save Schedule Immediately"
                  >
                    <Check size={14} /> Apply &amp; Save Schedule
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-soft">Email Body</label>
              <textarea
                value={bodyInput}
                onChange={(e) => setBodyInput(e.target.value)}
                rows={6}
                className="input-field text-xs leading-relaxed font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setIsEditing(false)} className="btn-secondary py-1.5 px-3 text-xs">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="btn-accent py-1.5 px-3 text-xs font-bold">
                Save Timing &amp; Copy Changes
              </button>
            </div>
          </div>
        ) : (
          /* Viewing Mode */
          <div className="space-y-2">
            <p className="text-sm font-bold text-ink flex items-center gap-1.5">
              <span className="text-ink-muted font-normal text-xs uppercase tracking-wider">
                Subject:
              </span>
              {step.subject}
            </p>
            <div className="rounded-xl border border-border/50 bg-canvas/60 p-4 text-xs text-ink-soft leading-relaxed whitespace-pre-line font-sans space-y-3">
              {displayBody}
            </div>
            <div className="flex items-center justify-between text-[11px] text-ink-muted pt-1">
              <span>Approx. {displayBody ? displayBody.split(/\s+/).filter(Boolean).length : 0} words</span>
              <button
                onClick={() =>
                  onPreviewStep({
                    ...step,
                    scheduledDate: formatDisplayDateTime(dateTimeInput),
                    body: displayBody,
                  })
                }
                className="text-accent-600 font-medium hover:underline flex items-center gap-1 font-bold"
              >
                Full Webmail Preview &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(SequenceStep);
