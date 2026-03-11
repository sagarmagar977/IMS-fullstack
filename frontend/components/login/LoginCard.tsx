"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLoginMutation } from "@/app/redux/api";

const LOGO_URL =
  "https://play-lh.googleusercontent.com/XgPMfb6xTqe-4lpJd_XikSM061A8mCG0VIJZdlHKrwI35h4-RnHbF844nDiqXW1VYkw=w600-h300-pc0xffffff-pd";

export function LoginCard() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    const res = await login({ email, password }).unwrap();

    localStorage.setItem("accessToken", res.access);
    localStorage.setItem("refreshToken", res.refresh);

    router.push("/dashboard");
  } catch (err: unknown) {
  console.error("Login failed", err);
}
};

  return (
    <div className="w-full max-w-[700px] rounded-2xl border bg-blue-50 p-8 shadow-xl">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="relative h-16 w-16 overflow-hidden rounded-full">
          <Image
            src={LOGO_URL}
            alt="IMS Logo"
            fill
            sizes="64px"
            className="object-cover"
            priority
          />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-blue-600">
          Inventory Management System
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Use credentials provided by your administrator
        </p>
      </div>

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="user@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-24"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[38px] text-sm font-medium text-blue-600 hover:underline"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox id="remember" label="Remember me" />

          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <Button type="submit" fullWidth className="py-3" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Having trouble? Contact your administrator
      </p>
    </div>
  );
}