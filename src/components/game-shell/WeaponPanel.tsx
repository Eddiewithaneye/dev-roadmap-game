import Image from "next/image";
import type { WeaponPanelProps } from "./types";

export function WeaponPanel({
  weapon,
  mode,
  isReady,
  cooldownRemaining,
  onAttack,
  onDamageChange,
  onCooldownChange,
  onRangeChange,
}: WeaponPanelProps) {
  const isDevMode = mode === "dev";

  return (
    <div className="pointer-events-auto absolute bottom-32 left-1/2 z-20 w-[360px] -translate-x-1/2 rounded border border-cyan-300/30 bg-black/80 p-4 shadow-[0_0_60px_rgba(8,145,178,0.2)]">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded bg-[#041c28] text-5xl">
          {weapon.icon}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
            {weapon.category}
          </div>
          <div className="text-lg font-bold text-white">{weapon.name}</div>
          <div className="text-sm text-cyan-200">{weapon.weaponName}</div>
          <div className="mt-2 text-xs leading-5 text-slate-300">
            {weapon.description}
          </div>
        </div>
      </div>

      {weapon.imageSrc ? (
        <div className="relative mb-3 h-44 overflow-hidden rounded border border-cyan-300/20">
          <Image
            src={weapon.imageSrc}
            alt={weapon.weaponName}
            fill
            className="object-cover"
          />
        </div>
      ) : null}

      {weapon.visualEffect ? (
        <div className="mb-3 rounded bg-cyan-950/20 px-2 py-1 text-xs text-cyan-200">
          {weapon.visualEffect}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 text-xs text-white">
        <StatTile label="Damage" value={weapon.damage} />
        <StatTile label="Cooldown" value={`${weapon.cooldown}s`} />
        <StatTile label="Range" value={weapon.range} />
      </div>

      {isDevMode ? (
        <div className="mt-4 space-y-3 text-xs text-slate-200">
          <TuningSlider
            label="Damage"
            min={8}
            max={40}
            value={weapon.damage}
            onChange={onDamageChange}
          />
          <TuningSlider
            label="Cooldown"
            min={1}
            max={6}
            value={weapon.cooldown}
            suffix="s"
            onChange={onCooldownChange}
          />
          <TuningSlider
            label="Range"
            min={2}
            max={12}
            value={weapon.range}
            onChange={onRangeChange}
          />
        </div>
      ) : null}

      <button
        className="mt-4 w-full rounded bg-cyan-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-800/60"
        onClick={onAttack}
        disabled={!isReady}
      >
        {isReady ? "Cast Event Spark" : `Ready in ${cooldownRemaining}s`}
      </button>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded border border-cyan-300/20 bg-[#081a23] p-2 text-center">
      {label}
      <div className="mt-1 text-2xl font-bold text-cyan-200">{value}</div>
    </div>
  );
}

function TuningSlider({
  label,
  min,
  max,
  value,
  suffix = "",
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span>
          {value}
          {suffix}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-cyan-300"
      />
    </div>
  );
}
