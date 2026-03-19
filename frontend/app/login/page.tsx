import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth-constants";
import { LoginCard } from "@/components/login/LoginCard";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const isAuthenticated =
    Boolean(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value) || Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE)?.value);

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#eef5ff_0,_#edf4ff_18%,_#dde6eb_52%,_#d3dddd_100%)] px-4 py-5 sm:px-6 sm:py-6">
      <div className="w-full max-w-[40rem]">
        <LoginCard />
      </div>
    </div>
  );
}
