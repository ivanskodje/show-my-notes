import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const dayInMs = 1000 * 60 * 60 * 24;
  const monthInMs = dayInMs * 30;
  const yearInMs = dayInMs * 365;

  if (diffInMs < dayInMs) {
    return "Today";
  } else if (diffInMs < monthInMs) {
    const days = Math.floor(diffInMs / dayInMs);
    return `${days} Day${days > 1 ? "s" : ""} Ago`;
  } else if (diffInMs < yearInMs) {
    const months = Math.floor(diffInMs / monthInMs);
    return `${months} Month${months > 1 ? "s" : ""} Ago`;
  } else {
    const years = Math.floor(diffInMs / yearInMs);
    return `${years} Year${years > 1 ? "s" : ""} Ago`;
  }
}

export function getEnvString(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.warn(`Warning: Environment variable "${name}" is missing or empty.`);
    return "";
  }
  return value;
}

/**
 * A secure comparison function to prevent timing attacks.
 * This is especially useful for comparing secrets passed into APIs.
 */
export function secureCompare(a: string, b: string): boolean {
  const maxLength = Math.max(a.length, b.length);
  const bufferA = Buffer.from(a.padEnd(maxLength, "\0"));
  const bufferB = Buffer.from(b.padEnd(maxLength, "\0"));

  return crypto.timingSafeEqual(bufferA, bufferB);
}
