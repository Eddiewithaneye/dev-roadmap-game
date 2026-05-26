import type { ResourceStatProps } from "./types";

export function ResourceStat({ icon, label, value }: ResourceStatProps) {
  return (
    <div className="flex items-center gap-3 border-l border-cyan-300/20 px-5">
      <span className="text-2xl text-cyan-300">{icon}</span>
      <div>
        <div className="text-2xl font-bold leading-6 text-white">
          {value.toLocaleString()}
        </div>
        <div className="text-xs font-bold text-cyan-300">{label}</div>
      </div>
    </div>
  );
}
