import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-constants";

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated =
    Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value) || Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);

  redirect(isAuthenticated ? "/dashboard" : "/login");
}
