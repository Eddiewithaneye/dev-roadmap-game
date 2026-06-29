import type { ResourceStatProps } from "./types";

export function ResourceStat({
  icon,
  label,
  value,
  density = "default",
}: ResourceStatProps) {
  const isCompact = density === "compact";

  return (
    <div
      className={`flex items-center border-l border-cyan-300/20 ${
        isCompact ? "gap-1 px-2" : "gap-3 px-5"
      }`}
    >
      <span className={isCompact ? "text-sm text-cyan-300" : "text-2xl text-cyan-300"}>
        {icon}
      </span>
      <div>
        <div
          className={`font-bold text-white ${
            isCompact ? "text-xs leading-3" : "text-2xl leading-6"
          }`}
        >
          {value.toLocaleString()}
        </div>
        <div
          className={`font-bold text-cyan-300 ${
            isCompact ? "text-[8px] leading-none" : "text-xs"
          }`}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
