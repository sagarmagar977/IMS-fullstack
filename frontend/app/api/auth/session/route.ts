import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_EMAIL_COOKIE } from "@/lib/auth-constants";

export async function GET() {
  const cookieStore = await cookies();
  const authenticated =
    Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value) || Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);

  return NextResponse.json({
    authenticated,
    email: cookieStore.get(USER_EMAIL_COOKIE)?.value ?? "",
  });
}
