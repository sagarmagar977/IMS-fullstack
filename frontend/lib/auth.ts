export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_EMAIL_KEY = "ims_user_email";

export function storeAuthSession(access: string, refresh: string, email: string) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  localStorage.setItem(USER_EMAIL_KEY, email);
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
}

export function getStoredUserEmail() {
  if (typeof window === "undefined") {
    return "";
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
