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

/**
 * Detects whether an email body already contains a closing sign-off or signature block near the end.
 */
export function hasExistingSignature(bodyText: string): boolean {
  if (!bodyText) return false;
  const trimmed = bodyText.trim();
  // Examine the last 250 characters of the body text
  const lastChunk = trimmed.slice(-250).toLowerCase();

  const signOffPatterns = [
    /\b(best regards|kind regards|warm regards|regards|best|sincerely|thanks|thank you|cheers|best wishes|yours truly|respectfully|warmly|with appreciation)\b/i,
  ];

  return signOffPatterns.some((pattern) => pattern.test(lastChunk));
}

/**
 * Cleans up brackets, placeholders, duplicate consecutive lines, and formats sign-off cleanly.
 */
export function cleanSignature(bodyText: string, nameToUse?: string): string {
  if (!bodyText) return bodyText;
  let text = bodyText;
  const name = nameToUse?.trim() || "";

  // 1. Remove bracketed contact placeholders like [Phone], [Email], [Phone] | [Email], etc.
  text = text
    .replace(/\[Phone\]\s*\|\s*\[Email\]/gi, "")
    .replace(/\[(?:Phone|Email|Phone Number|Your Phone|Your Email|Your Title|Your Position|Company|Your Company|Website)(?:\/[^\]]+)?\]/gi, "")
    .replace(/\[Phone\/Email\]/gi, "");

  // 2. Replace name placeholders with actual sender name or clean bracket
  if (name) {
    text = text
      .replace(/\[Your Name(?:\/[^\]]+)?\]/gi, name)
      .replace(/\[Your (?:Full Name|Position|Title|Company)\]/gi, "")
      .replace(/\[Sender Name\]/gi, name);
  } else {
    text = text.replace(/\[(?:Your Name|Sender Name)(?:\/[^\]]+)?\]/gi, "");
  }

  // 3. Remove consecutive duplicate lines (e.g. "Mohsin Ali\nMohsin Ali")
  const lines = text.split("\n");
  const cleanedLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const current = lines[i].trim();
    const prev = cleanedLines.length > 0 ? cleanedLines[cleanedLines.length - 1].trim() : null;

    if (current && prev && current.toLowerCase() === prev.toLowerCase()) {
      continue;
    }
    cleanedLines.push(lines[i]);
  }
  text = cleanedLines.join("\n").trim();

  // 4. If sender name is available and text ends with a sign-off without a name, append sender name on new line
  if (name) {
    const signoffEndRegex = /(Best regards,|Kind regards,|Warm regards,|Regards,|Sincerely,|Thanks,|Thank you,|Best,|Cheers,)\s*$/i;
    if (signoffEndRegex.test(text)) {
      text = text.replace(signoffEndRegex, `$1\n${name}`);
    }
  }

  return text;
}

/**
 * Returns formatted body text ensuring signature is present exactly once, without duplicating existing sign-offs.
 */
export function formatEmailBodyWithSignature(
  rawBody: string,
  senderName?: string,
  senderCompany?: string
): string {
  if (!rawBody) return "";
  const cleaned = cleanSignature(rawBody, senderName);

  if (hasExistingSignature(cleaned)) {
    return cleaned;
  }

  // Append signature cleanly if missing
  const name = senderName?.trim() || "";
  const company = senderCompany?.trim() || "";
  const signatureLines = ["Best regards,"];
  if (name) signatureLines.push(name);
  if (company && company !== "Our Team" && company !== "FollowLoop Inc.") {
    signatureLines.push(company);
  }

  return `${cleaned.trim()}\n\n${signatureLines.join("\n")}`;
}
