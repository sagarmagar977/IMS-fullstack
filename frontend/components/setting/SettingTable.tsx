"use client";

import Image from "next/image";
import NoDataImage from "@/app/(main)/image/no-data.png";

export function SettingTable() {
  return (
    <div className="flex h-[555px] flex-col items-center justify-center rounded-xl bg-white">
      <div className="flex flex-col items-center text-center px-6">
        <Image
          src={NoDataImage}
          alt="No data illustration"
          className="mb-6 h-auto w-64"
          priority
        />
        <h2 className="text-xl font-semibold text-blue-500">No Data Found</h2>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          Once you configure your settings, they will appear here.
        </p>
      </div>
    </div>
  );
}