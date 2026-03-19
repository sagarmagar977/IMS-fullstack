"use client";

import { useState } from "react";
import { Globe, LaptopMinimal, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDisplayName, getStoredUserEmail, persistUserEmail } from "@/lib/auth";
import { getApiBaseUrl } from "@/lib/api-base";

export function SettingTable() {
  const [initialState] = useState(() => {
    const storedEmail = getStoredUserEmail();
    const fallbackState = {
      displayName: getDisplayName(storedEmail),
      email: storedEmail,
      emailAlerts: true,
      lowStockAlerts: true,
      compactTables: false,
    };

    if (typeof window === "undefined") {
      return fallbackState;
    }

    const savedPrefs = localStorage.getItem("ims_ui_settings");
    if (!savedPrefs) {
      return fallbackState;
    }

    try {
      const parsed = JSON.parse(savedPrefs) as {
        compactTables?: boolean;
        emailAlerts?: boolean;
        lowStockAlerts?: boolean;
        displayName?: string;
      };

      return {
        displayName: parsed.displayName?.trim() || fallbackState.displayName,
        email: storedEmail,
        compactTables: Boolean(parsed.compactTables),
        emailAlerts: parsed.emailAlerts ?? true,
        lowStockAlerts: parsed.lowStockAlerts ?? true,
      };
    } catch {
      localStorage.removeItem("ims_ui_settings");
      return fallbackState;
    }
  });
  const [displayName, setDisplayName] = useState(initialState.displayName);
  const [email, setEmail] = useState(initialState.email);
  const [emailAlerts, setEmailAlerts] = useState(initialState.emailAlerts);
  const [lowStockAlerts, setLowStockAlerts] = useState(initialState.lowStockAlerts);
  const [compactTables, setCompactTables] = useState(initialState.compactTables);
  const [statusMessage, setStatusMessage] = useState("");

  const handleSave = () => {
    localStorage.setItem(
      "ims_ui_settings",
      JSON.stringify({
        displayName,
        compactTables,
        emailAlerts,
        lowStockAlerts,
      })
    );
    if (email.trim()) {
      persistUserEmail(email.trim());
    }
    setStatusMessage("Settings saved for this browser.");
  };

  return (
    <div className="ims-reveal rounded-[24px] border border-[#dfe6e6] bg-white p-4 sm:p-6 lg:p-8">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="ims-card rounded-[22px] border border-[#e8eeee] bg-[#fbfcfc] p-4 sm:p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f3ff] text-[#1476d0]">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#29313a]">Account</h2>
              <p className="text-sm text-[#7d8792]">Keep profile and contact information current.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </section>

        <section className="ims-card rounded-[22px] border border-[#e8eeee] bg-[#fbfcfc] p-4 sm:p-5 [animation-delay:120ms]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf8ee] text-[#2d9d57]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#29313a]">Session & Security</h2>
              <p className="text-sm text-[#7d8792]">Current session controls for this device.</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-[#4d5560]">
            <div className="flex items-center justify-between rounded-2xl border border-[#e6ecec] bg-white px-4 py-3">
              <span>Session status</span>
              <span className="rounded-full bg-[#e8f7eb] px-3 py-1 text-xs font-semibold text-[#23834b]">Active</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-[#e6ecec] bg-white px-4 py-3">
              <span>Inventory API</span>
              <span className="truncate pl-4 text-right text-xs text-[#7d8792]">
                {getApiBaseUrl()}
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <PreferenceCard
          icon={<LaptopMinimal className="h-5 w-5" />}
          title="Table Density"
          description="Reduce table spacing to fit more content on smaller screens."
          enabled={compactTables}
          onToggle={() => setCompactTables((current) => !current)}
        />
        <PreferenceCard
          icon={<Mail className="h-5 w-5" />}
          title="Email Alerts"
          description="Receive updates for assignments and approval-related events."
          enabled={emailAlerts}
          onToggle={() => setEmailAlerts((current) => !current)}
        />
        <PreferenceCard
          icon={<Globe className="h-5 w-5" />}
          title="Low Stock Alerts"
          description="Show warnings when consumables drop below configured thresholds."
          enabled={lowStockAlerts}
          onToggle={() => setLowStockAlerts((current) => !current)}
        />
      </div>

      <div className="ims-reveal mt-6 flex flex-col gap-3 border-t border-[#ebf0f0] pt-5 sm:flex-row sm:items-center sm:justify-between [animation-delay:240ms]">
        <p className="text-sm text-[#7d8792]">
          Settings now have actual account, notification, and session controls instead of an empty state.
        </p>
        <div className="flex items-center gap-3">
          {statusMessage ? <span className="text-sm text-[#1676d1]">{statusMessage}</span> : null}
          <Button type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

function PreferenceCard({
  icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="ims-card rounded-[22px] border border-[#e8eeee] bg-[#fbfcfc] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#1676d1]">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-[#29313a]">{title}</h3>
          <p className="text-sm text-[#7d8792]">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex h-8 w-14 items-center rounded-full p-1 transition-all duration-300 ${enabled ? "bg-[#1676d1]" : "bg-[#d8e0e0]"}`}
        aria-pressed={enabled}
      >
        <span
          className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${enabled ? "translate-x-6" : "translate-x-0"}`}
        />
      </button>
    </section>
  );
}
