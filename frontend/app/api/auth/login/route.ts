import { NextResponse } from "next/server";
import { getBackendApiBaseUrl, setAuthCookies } from "@/lib/server-auth";

export async function POST(request: Request) {
  const credentials = await request.json().catch(() => null);

  if (!credentials || typeof credentials.email !== "string" || typeof credentials.password !== "string") {
    return NextResponse.json({ detail: "Email and password are required." }, { status: 400 });
  }

  try {
    const backendResponse = await fetch(`${getBackendApiBaseUrl()}auth/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
      cache: "no-store",
    });

    const data = await backendResponse.json().catch(() => null);
    if (!backendResponse.ok || !data?.access || !data?.refresh) {
      return NextResponse.json(data ?? { detail: "Login failed." }, { status: backendResponse.status || 500 });
    }

    const response = NextResponse.json({ success: true, email: credentials.email.trim() });
    setAuthCookies(response.cookies, {
      access: data.access,
      refresh: data.refresh,
      email: credentials.email.trim(),
    });
    return response;
  } catch {
    return NextResponse.json({ detail: "Cannot reach backend API." }, { status: 502 });
  }
}
