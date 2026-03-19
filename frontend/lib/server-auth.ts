import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  USER_EMAIL_COOKIE,
} from "@/lib/auth-constants";

const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
const ACCESS_TOKEN_MAX_AGE = 60 * 15;

const normalizeApiBase = (value: string) => (value.endsWith("/") ? value : `${value}/`);

export function getBackendApiBaseUrl() {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL_LOCAL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000/api/";

  return normalizeApiBase(apiBase);
}

type MutableCookieStore = {
  set: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      path: string;
      maxAge: number;
    }
  ) => void;
};

function getSecureCookieFlag() {
  return process.env.NODE_ENV === "production";
}

export function setAuthCookies(
  cookiesStore: MutableCookieStore,
  session: { access: string; refresh: string; email?: string }
) {
  cookiesStore.set(ACCESS_TOKEN_COOKIE, session.access, {
    httpOnly: true,
    sameSite: "lax",
    secure: getSecureCookieFlag(),
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  cookiesStore.set(REFRESH_TOKEN_COOKIE, session.refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: getSecureCookieFlag(),
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  if (session.email?.trim()) {
    cookiesStore.set(USER_EMAIL_COOKIE, session.email.trim(), {
      httpOnly: false,
      sameSite: "lax",
      secure: getSecureCookieFlag(),
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
  }
}

export function clearAuthCookies(cookiesStore: MutableCookieStore) {
  for (const name of [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_EMAIL_COOKIE]) {
    cookiesStore.set(name, "", {
      httpOnly: name !== USER_EMAIL_COOKIE,
      sameSite: "lax",
      secure: getSecureCookieFlag(),
      path: "/",
      maxAge: 0,
    });
  }
}

export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${getBackendApiBaseUrl()}auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as { access?: string } | null;
  return {
    ok: response.ok && Boolean(data?.access),
    access: data?.access,
  };
}

export async function buildAuthorizedBackendRequest(
  request: NextRequest,
  pathParts: string[]
) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : Buffer.from(await request.arrayBuffer());

  const runRequest = async (token?: string) => {
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    const accept = request.headers.get("accept");

    if (contentType) {
      headers.set("content-type", contentType);
    }
    if (accept) {
      headers.set("accept", accept);
    }
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return fetch(`${getBackendApiBaseUrl()}${pathParts.join("/")}/${request.nextUrl.search}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
  };

  let backendResponse = await runRequest(accessToken);
  let nextAccessToken = accessToken;

  if (backendResponse.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed.ok && refreshed.access) {
      nextAccessToken = refreshed.access;
      backendResponse = await runRequest(refreshed.access);
    }
  }

  return {
    backendResponse,
    accessToken: nextAccessToken,
    refreshToken,
  };
}

export async function toNextProxyResponse(
  request: NextRequest,
  pathParts: string[]
) {
  try {
    const { backendResponse, accessToken, refreshToken } = await buildAuthorizedBackendRequest(request, pathParts);
    const responseHeaders = new Headers();
    const contentType = backendResponse.headers.get("content-type");
    const contentDisposition = backendResponse.headers.get("content-disposition");

    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }
    if (contentDisposition) {
      responseHeaders.set("content-disposition", contentDisposition);
    }

    const nextResponse = new NextResponse(await backendResponse.arrayBuffer(), {
      status: backendResponse.status,
      headers: responseHeaders,
    });

    if (backendResponse.ok && accessToken && refreshToken) {
      nextResponse.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: getSecureCookieFlag(),
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
    } else if (backendResponse.status === 401) {
      clearAuthCookies(nextResponse.cookies);
    }

    return nextResponse;
  } catch {
    return NextResponse.json({ detail: "Cannot reach backend API." }, { status: 502 });
  }
}
