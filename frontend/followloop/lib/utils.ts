import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toString();
}

/**
 * Format a Date object as a local ISO string (YYYY-MM-DDTHH:mm) preserving local timezone offset.
 */
export function toLocalISOString(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get current local date-time string suitable for input[type="datetime-local"] min attribute.
 */
export function getMinDateTime(): string {
  return toLocalISOString(new Date());
}

/**
 * Robustly format date string or ISO timestamp into local human-readable string (e.g. "Aug 15, 01:40 PM")
 */
export function formatDisplayDateTime(dtStr?: string): string {
  if (!dtStr) return "Not Scheduled";
  try {
    let dt: Date;
    if (dtStr.includes("T") && !dtStr.endsWith("Z") && !dtStr.includes("+")) {
      // Local ISO format without timezone offset (e.g. 2026-08-15T13:40)
      const [datePart, timePart] = dtStr.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);
      dt = new Date(year, month - 1, day, hours, minutes);
    } else {
      dt = new Date(dtStr);
    }

    if (isNaN(dt.getTime())) return dtStr;

    return dt.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dtStr;
  }
}
