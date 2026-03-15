"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useLoginMutation } from "@/app/redux/api";
import { storeAuthSession } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-base";

export function LoginCard() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getLoginErrorMessage = (err: FetchBaseQueryError | SerializedError | unknown): string => {
    if (typeof err === "object" && err !== null && "status" in err) {
      const fetchErr = err as FetchBaseQueryError;
      if (fetchErr.status === "FETCH_ERROR") {
        return `Cannot reach backend API at ${getApiBaseUrl()}.`;
      }
      if (fetchErr.status === "PARSING_ERROR") {
        return "Unexpected server response while logging in.";
      }
      if (typeof fetchErr.data === "object" && fetchErr.data !== null) {
        const data = fetchErr.data as Record<string, unknown>;
        const detail = data.detail;
        if (typeof detail === "string" && detail.trim()) {
          return detail;
        }
        const emailError = data.email;
        if (Array.isArray(emailError) && typeof emailError[0] === "string") {
          return emailError[0];
        }
        const passwordError = data.password;
        if (Array.isArray(passwordError) && typeof passwordError[0] === "string") {
          return passwordError[0];
        }
      }
      return "Login failed. Check email/password and try again.";
    }
    if (typeof err === "object" && err !== null && "message" in err) {
      const serializedErr = err as SerializedError;
      if (serializedErr.message) {
        return serializedErr.message;
      }
    }
    return "Login failed due to an unexpected error.";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await login({ email: email.trim(), password }).unwrap();

      storeAuthSession(res.access, res.refresh, email.trim());

      router.push("/dashboard");
    } catch (err: unknown) {
      const message = getLoginErrorMessage(err);
      setErrorMessage(message);
      // Expected auth/network failures are shown in UI; avoid noisy Next.js dev overlay.
      console.warn("Login failed:", message);
    }
  };

  return (
    <div className="mx-auto grid w-full gap-[1.05rem] rounded-[1.65rem] border border-white/60 bg-[linear-gradient(180deg,_rgba(247,250,252,0.96),_rgba(237,244,249,0.94))] p-[clamp(1.2rem,1.3vw,1.65rem)] shadow-[0_20px_56px_rgba(21,42,60,0.12)] backdrop-blur">
      <div className="flex flex-col items-center text-center">
        <div className="relative h-[4.25rem] w-[4.25rem] overflow-hidden">
          <Image
            src="/image/Nepal Government logo.svg"
            alt="Nepal Government Logo"
            fill
            sizes="68px"
            className="object-contain"
            priority
          />
        </div>

        <h1 className="mt-3.5 text-[clamp(1.35rem,1.8vw,1.75rem)] font-semibold tracking-[-0.04em] text-[#1466b8]">
          Inventory Management System
        </h1>

        <p className="mt-2 max-w-[28rem] text-[0.95rem] leading-6 text-[#5f6d7c]">
          Sign in to manage inventory, assignments, audit activity, and stock operations.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="user@gmail.com"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="pr-18"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-[2.55rem] text-[0.8rem] font-medium text-blue-600 hover:underline"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <Checkbox id="remember" label="Remember me" />

          <button
            type="button"
            className="text-[0.88rem] font-medium text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <Button type="submit" fullWidth className="py-2.5 text-[0.96rem]" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>

        {errorMessage && (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}
      </form>

      <p className="text-center text-[0.84rem] text-[#70808f]">
        Having trouble? Contact your administrator.
      </p>
    </div>
  );
}
