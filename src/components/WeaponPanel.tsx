"use client";

import Image from "next/image";
import type { Weapon } from "@/types/weapon";

type WeaponPanelProps = {
  weapon: Weapon;
  isReady: boolean;
  cooldownRemaining: number;
  onAttack: () => void;
  onDamageChange: (value: number) => void;
  onCooldownChange: (value: number) => void;
  onRangeChange: (value: number) => void;
};

export default function WeaponPanel({
  weapon,
  isReady,
  cooldownRemaining,
  onAttack,
  onDamageChange,
  onCooldownChange,
  onRangeChange,
}: WeaponPanelProps) {
  return (
    <div className="pointer-events-auto absolute bottom-32 left-1/2 z-20 w-[360px] -translate-x-1/2 rounded-3xl border border-cyan-300/30 bg-black/70 p-4 shadow-[0_0_60px_rgba(8,145,178,0.2)]">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#041c28] text-5xl">
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
          {weapon.imageSrc ? (
            <div className="mt-3 relative h-56 overflow-hidden rounded-3xl border border-cyan-300/20">
              <Image
                src={weapon.imageSrc}
                alt={weapon.weaponName}
                fill
                className="object-cover"
              />
            </div>
          ) : null}
          {weapon.visualEffect ? (
            <div className="mt-2 rounded bg-cyan-950/20 px-2 py-1 text-xs text-cyan-200">
              {weapon.visualEffect}
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs text-white">
        <div className="rounded border border-cyan-300/20 bg-[#081a23] p-2 text-center">
          Damage
          <div className="mt-1 text-2xl font-bold text-cyan-200">
            {weapon.damage}
          </div>
        </div>
        <div className="rounded border border-cyan-300/20 bg-[#081a23] p-2 text-center">
          Cooldown
          <div className="mt-1 text-2xl font-bold text-cyan-200">
            {weapon.cooldown}s
          </div>
        </div>
        <div className="rounded border border-cyan-300/20 bg-[#081a23] p-2 text-center">
          Range
          <div className="mt-1 text-2xl font-bold text-cyan-200">
            {weapon.range}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-xs text-slate-200">
        <label className="flex items-center justify-between gap-3">
          <span>Damage</span>
          <span>{weapon.damage}</span>
        </label>
        <input
          type="range"
          min={8}
          max={40}
          value={weapon.damage}
          onChange={(event) => onDamageChange(Number(event.target.value))}
          className="w-full accent-cyan-300"
        />

        <label className="flex items-center justify-between gap-3">
          <span>Cooldown</span>
          <span>{weapon.cooldown}s</span>
        </label>
        <input
          type="range"
          min={1}
          max={6}
          value={weapon.cooldown}
          onChange={(event) => onCooldownChange(Number(event.target.value))}
          className="w-full accent-cyan-300"
        />

        <label className="flex items-center justify-between gap-3">
          <span>Range</span>
          <span>{weapon.range}</span>
        </label>
        <input
          type="range"
          min={2}
          max={12}
          value={weapon.range}
          onChange={(event) => onRangeChange(Number(event.target.value))}
          className="w-full accent-cyan-300"
        />
      </div>

      <button
        className="mt-4 w-full rounded-full bg-cyan-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-800/60"
        onClick={onAttack}
        disabled={!isReady}
      >
        {isReady ? "Cast Event Spark" : `Ready in ${cooldownRemaining}s`}
      </button>
    </div>
  );
}
