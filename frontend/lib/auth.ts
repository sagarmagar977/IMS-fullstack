"use client";

import { USER_EMAIL_COOKIE, USER_EMAIL_KEY } from "@/lib/auth-constants";

export { USER_EMAIL_COOKIE, USER_EMAIL_KEY };

export function persistUserEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = email.trim();
  if (!normalized) {
    clearStoredUserEmail();
    return;
  }

  localStorage.setItem(USER_EMAIL_KEY, normalized);
  document.cookie = `${USER_EMAIL_COOKIE}=${encodeURIComponent(normalized)}; Path=/; Max-Age=2592000; SameSite=Lax`;
}

export function clearStoredUserEmail() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(USER_EMAIL_KEY);
  document.cookie = `${USER_EMAIL_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function getStoredUserEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  const cookieEntry = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${USER_EMAIL_COOKIE}=`));

  if (cookieEntry) {
    const [, value = ""] = cookieEntry.split("=");
    return decodeURIComponent(value);
  }

  return localStorage.getItem(USER_EMAIL_KEY) ?? "";
}

export function getDisplayName(email: string) {
  const normalized = email.trim();
  if (!normalized) {
    return "Store Manager";
  }

  const [rawName] = normalized.split("@");
  return rawName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
