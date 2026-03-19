import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-constants";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isAuthenticated =
    Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value) || Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);

  if (!isAuthenticated) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
