"use client";

import { useEffect, useRef, useState } from "react";

import {
  GIT_FETCH_UPGRADES,
  type GitFetchUpgradeId,
} from "@/game/config/git-fetch-upgrades";
import type { GitFetchUpgradeRarity, RunStatKey } from "@/game/domain/sprint";

const STAT_OPTIONS: Array<{
  key: RunStatKey;
  label: string;
  description: string;
}> = [
  {
    key: "stamina",
    label: "Stamina",
    description: "+20 max health and +20 current health.",
  },
  {
    key: "flow",
    label: "Flow",
    description: "+8% movement speed.",
  },
  {
    key: "proficiency",
    label: "Proficiency",
    description: "-8% weapon cooldown.",
  },
  {
    key: "security",
    label: "Security",
    description: "Block 2 flat damage from each hit.",
  },
  {
    key: "efficiency",
    label: "Efficiency",
    description: "+10% outgoing damage.",
  },
];

const EMPTY_ALLOCATIONS: Record<RunStatKey, number> = {
  stamina: 0,
  flow: 0,
  proficiency: 0,
  security: 0,
  efficiency: 0,
};

type LevelUpModalProps = {
  codeFragments: number;
  pendingLevelUps: number;
  purchasedGitFetchUpgrades: Partial<Record<GitFetchUpgradeId, number>>;
  onConfirmStats: (allocations: Record<RunStatKey, number>) => void;
  onPurchaseUpgrade: (upgradeId: GitFetchUpgradeId) => boolean;
};

export function LevelUpModal({
  codeFragments,
  pendingLevelUps,
  purchasedGitFetchUpgrades,
  onConfirmStats,
  onPurchaseUpgrade,
}: LevelUpModalProps) {
  const [allocations, setAllocations] =
    useState<Record<RunStatKey, number>>(EMPTY_ALLOCATIONS);
  const [offerIds, setOfferIds] = useState<GitFetchUpgradeId[]>(() =>
    selectRandomUpgradeOfferIds(purchasedGitFetchUpgrades),
  );
  const [isRolling, setIsRolling] = useState(true);
  const purchasedGitFetchUpgradesRef = useRef(purchasedGitFetchUpgrades);
  const spentPoints = Object.values(allocations).reduce(
    (total, value) => total + value,
    0,
  );
  const remainingPoints = 3 - spentPoints;
  const offeredUpgrades = offerIds
    .map((offerId) =>
      GIT_FETCH_UPGRADES.find((upgrade) => upgrade.id === offerId),
    )
    .filter((upgrade) => upgrade !== undefined);

  useEffect(() => {
    purchasedGitFetchUpgradesRef.current = purchasedGitFetchUpgrades;
  }, [purchasedGitFetchUpgrades]);

  useEffect(() => {
    const rerollTimeout = window.setTimeout(() => {
      setIsRolling(true);
      setOfferIds(
        selectRandomUpgradeOfferIds(purchasedGitFetchUpgradesRef.current),
      );
    }, 0);

    const rollingTimeout = window.setTimeout(() => setIsRolling(false), 650);

    return () => {
      window.clearTimeout(rerollTimeout);
      window.clearTimeout(rollingTimeout);
    };
  }, [pendingLevelUps]);

  function updateAllocation(stat: RunStatKey, delta: 1 | -1) {
    setAllocations((current) => {
      const nextValue = current[stat] + delta;

      if (nextValue < 0 || (delta > 0 && remainingPoints <= 0)) {
        return current;
      }

      return {
        ...current,
        [stat]: nextValue,
      };
    });
  }

  function confirmStats() {
    if (spentPoints !== 3) {
      return;
    }

    onConfirmStats(allocations);
    setAllocations(EMPTY_ALLOCATIONS);
  }

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#071018]/88 px-4">
      <section className="pointer-events-auto grid max-h-[calc(100vh-48px)] w-[min(980px,100%)] gap-5 overflow-y-auto border-2 border-cyan-200/70 bg-[#071018] p-5 shadow-[0_0_56px_rgba(34,211,238,0.22)] lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="text-sm font-bold uppercase tracking-wide text-cyan-200">
            Level Up
          </div>
          <h2 className="mt-1 text-3xl font-bold text-white">
            Allocate Stat Points
          </h2>
          <div className="mt-2 font-bold text-amber-200">
            {remainingPoints} / 3 points remaining
            {pendingLevelUps > 1 ? ` (${pendingLevelUps - 1} queued)` : ""}
          </div>

          <div className="mt-4 grid gap-3">
            {STAT_OPTIONS.map((stat) => (
              <div
                key={stat.key}
                className="grid grid-cols-[1fr_auto] gap-3 border border-cyan-300/20 bg-black/35 p-3"
              >
                <div>
                  <div className="font-bold text-cyan-100">{stat.label}</div>
                  <div className="mt-1 text-sm text-slate-300">
                    {stat.description}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="h-9 w-9 cursor-pointer border border-cyan-300/40 bg-black/60 text-lg font-bold text-cyan-100 transition hover:border-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={allocations[stat.key] <= 0}
                    onClick={() => updateAllocation(stat.key, -1)}
                    aria-label={`Remove ${stat.label} point`}
                  >
                    -
                  </button>
                  <div className="w-6 text-center text-xl font-bold">
                    {allocations[stat.key]}
                  </div>
                  <button
                    type="button"
                    className="h-9 w-9 cursor-pointer border border-cyan-300/40 bg-black/60 text-lg font-bold text-cyan-100 transition hover:border-cyan-100 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={remainingPoints <= 0}
                    onClick={() => updateAllocation(stat.key, 1)}
                    aria-label={`Add ${stat.label} point`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-5 w-full cursor-pointer border-2 border-emerald-300/70 bg-emerald-500/15 px-5 py-3 font-bold text-emerald-100 transition hover:border-emerald-100 hover:bg-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={spentPoints !== 3}
            onClick={confirmStats}
          >
            Commit Stats
          </button>
        </div>

        <div>
          <div className="text-sm font-bold uppercase tracking-wide text-amber-200">
            Git Fetch Upgrades
          </div>
          <h2 className="mt-1 text-3xl font-bold text-white">
            Spend Code Fragments
          </h2>
          <div className="mt-2 font-bold text-amber-100">
            {codeFragments.toLocaleString()} fragments available
          </div>
          <div className="mt-1 text-sm text-slate-300">
            Three random eligible options appear each level-up.
          </div>

          <div className="mt-4 grid gap-3">
            {offeredUpgrades.map((upgrade) => {
              const purchased = purchasedGitFetchUpgrades[upgrade.id] ?? 0;
              const isSoldOut = purchased >= upgrade.maxPurchases;
              const canAfford = codeFragments >= upgrade.cost;
              const rarityClass = getRarityClass(upgrade.rarity);

              return (
                <div
                  key={upgrade.id}
                  className={`border bg-black/35 p-3 transition ${
                    isRolling ? "scale-[0.98] animate-pulse blur-[1px]" : ""
                  } ${rarityClass.card}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-bold ${rarityClass.text}`}>
                          {upgrade.label}
                        </span>
                        <span
                          className={`border px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${rarityClass.badge}`}
                        >
                          {getRarityLabel(upgrade.rarity)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-slate-300">
                        {upgrade.description}
                      </div>
                      <div className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                        {purchased} / {upgrade.maxPurchases} purchased
                      </div>
                    </div>
                    <button
                      type="button"
                      className="min-w-24 cursor-pointer border border-amber-300/50 bg-amber-500/10 px-3 py-2 text-sm font-bold text-amber-100 transition hover:border-amber-100 hover:bg-amber-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={isSoldOut || !canAfford}
                      onClick={() => onPurchaseUpgrade(upgrade.id)}
                    >
                      {upgrade.cost}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function selectRandomUpgradeOfferIds(
  purchasedGitFetchUpgrades: Partial<Record<GitFetchUpgradeId, number>>,
) {
  const eligibleUpgrades = GIT_FETCH_UPGRADES.filter(
    (upgrade) =>
      (purchasedGitFetchUpgrades[upgrade.id] ?? 0) < upgrade.maxPurchases,
  );
  const weightedPool = eligibleUpgrades.flatMap((upgrade) => {
    const weight = getRarityWeight(upgrade.rarity);

    return Array.from({ length: weight }, () => upgrade.id);
  });
  const selectedIds: GitFetchUpgradeId[] = [];

  while (selectedIds.length < 3 && weightedPool.length > 0) {
    const randomIndex = Math.floor(Math.random() * weightedPool.length);
    const selectedId = weightedPool[randomIndex];

    if (!selectedIds.includes(selectedId)) {
      selectedIds.push(selectedId);
    }

    for (let index = weightedPool.length - 1; index >= 0; index -= 1) {
      if (weightedPool[index] === selectedId) {
        weightedPool.splice(index, 1);
      }
    }
  }

  return selectedIds;
}

function getRarityWeight(rarity: GitFetchUpgradeRarity) {
  if (rarity === "common") {
    return 7;
  }

  if (rarity === "uncommon") {
    return 4;
  }

  return 2;
}

function getRarityLabel(rarity: GitFetchUpgradeRarity) {
  if (rarity === "common") {
    return "Common";
  }

  if (rarity === "uncommon") {
    return "Uncommon";
  }

  return "Rare";
}

function getRarityClass(rarity: GitFetchUpgradeRarity) {
  if (rarity === "common") {
    return {
      card: "border-slate-300/30",
      text: "text-slate-100",
      badge: "border-slate-300/35 bg-slate-500/10 text-slate-100",
    };
  }

  if (rarity === "uncommon") {
    return {
      card: "border-emerald-300/35",
      text: "text-emerald-100",
      badge: "border-emerald-300/40 bg-emerald-500/10 text-emerald-100",
    };
  }

  return {
    card: "border-sky-300/40 shadow-[0_0_22px_rgba(56,189,248,0.12)]",
    text: "text-sky-100",
    badge: "border-sky-300/40 bg-sky-500/10 text-sky-100",
  };
}
