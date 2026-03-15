"use client";

import Image from "next/image";

export function EmptyState({
  title = "No Data Found",
  description,
  compact = false,
  fit = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
  fit?: boolean;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center px-6 text-center ${
        fit ? "h-full py-4" : compact ? "py-6" : "py-14"
      }`}
    >
      <div className={`relative ${compact ? "mb-3" : "mb-5"}`}>
        <Image
          src="/image/no-data.png"
          alt="No data"
          width={fit ? 190 : compact ? 240 : 340}
          height={fit ? 160 : compact ? 200 : 290}
          className={`h-auto ${
            fit ? "w-[150px] sm:w-[170px]" : compact ? "w-[190px] sm:w-[210px]" : "w-[270px] sm:w-[310px]"
          }`}
        />
      </div>
      <h3
        className={`font-semibold text-[#0f79d1] ${
          fit ? "text-[1.25rem] leading-none" : compact ? "text-[1.7rem] leading-none" : "text-3xl sm:text-4xl"
        }`}
      >
        {title}
      </h3>
      {description ? (
        <p className={`mt-3 max-w-[26rem] text-[#a2aab2] ${compact ? "text-[0.88rem]" : "text-sm"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
