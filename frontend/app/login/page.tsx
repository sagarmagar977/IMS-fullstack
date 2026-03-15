import { LoginCard } from "@/components/login/LoginCard";

export default function LoginPage() {
  return (
    <div className="flex h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_#eef5ff_0,_#edf4ff_18%,_#dde6eb_52%,_#d3dddd_100%)] px-4 py-5 sm:px-6 sm:py-6">
      <div className="w-full max-w-[40rem]">
        <LoginCard />
      </div>
    </div>
  );
}
