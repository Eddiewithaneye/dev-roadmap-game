"use client";

import type { SprintRetroSummary } from "@/game/domain/sprint";

type SprintRetroModalProps = {
  summary: SprintRetroSummary;
  onRestart: () => void;
  onSwitchToWaterfall: () => void;
};

export function SprintRetroModal({
  summary,
  onRestart,
  onSwitchToWaterfall,
}: SprintRetroModalProps) {
  const isVictory = summary.outcome === "victory";
  const accentClass = isVictory
    ? "border-emerald-300/70 shadow-[0_0_56px_rgba(16,185,129,0.24)]"
    : "border-red-300/60 shadow-[0_0_48px_rgba(248,113,113,0.2)]";
  const eyebrowClass = isVictory ? "text-emerald-200" : "text-red-200";
  const title = isVictory ? "Sprint Complete" : "Sprint Failed";
  const message = isVictory
    ? "You have a job offer waiting!"
    : "You have been laid off!";

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#071018]/86 px-4">
      <section
        className={`sprint-retro-modal pointer-events-auto w-[min(640px,100%)] border-2 bg-black/84 p-6 text-center ${accentClass}`}
      >
        <div
          className={`sprint-retro-eyebrow text-sm font-bold uppercase tracking-wide ${eyebrowClass}`}
        >
          {title}
        </div>
        <div className="sprint-retro-title mt-2 text-3xl font-bold text-white">
          {message}
        </div>

        <div className="sprint-retro-panel mt-6 border border-cyan-300/20 bg-[#071018]/80 p-4 text-left">
          <div className="sprint-retro-panel-title text-sm font-bold uppercase tracking-wide text-cyan-200">
            Sprint Retro
          </div>
          <div className="sprint-retro-stats mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <RetroStat
              label="Enemies"
              value={summary.stats.enemiesDefeated.toLocaleString()}
            />
            <RetroStat
              label="Survived"
              value={formatDuration(summary.stats.timeSurvivedSeconds)}
            />
            <RetroStat
              label="Fragments"
              value={summary.stats.codeFragmentsFound.toLocaleString()}
            />
            <RetroStat
              label="Cred"
              value={`+${summary.credEarned.toLocaleString()}`}
            />
          </div>

          {summary.accomplishments.length > 0 ? (
            <div className="sprint-retro-accomplishments mt-4 grid gap-2">
              {summary.accomplishments.map((accomplishment) => (
                <div
                  key={accomplishment.id}
                  className="flex items-center justify-between border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-sm"
                >
                  <span className="font-bold text-amber-100">
                    {accomplishment.label}
                  </span>
                  <span className="font-bold text-amber-200">
                    +{accomplishment.cred} Cred
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="sprint-retro-actions mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            className="sprint-retro-action cursor-pointer border-2 border-cyan-300/70 bg-cyan-500/15 px-5 py-3 font-bold text-cyan-100 transition hover:border-cyan-100 hover:bg-cyan-400/25"
            onClick={onRestart}
          >
            Start New Sprint
          </button>
          {isVictory ? (
            <button
              type="button"
              className="sprint-retro-action cursor-pointer border-2 border-amber-300/75 bg-amber-500/15 px-5 py-3 font-bold text-amber-100 transition hover:border-amber-100 hover:bg-amber-400/25"
              onClick={onSwitchToWaterfall}
            >
              Switch to Waterfall
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function RetroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="sprint-retro-stat border border-cyan-300/15 bg-black/45 p-3">
      <div className="sprint-retro-stat-value text-xl font-bold text-white">
        {value}
      </div>
      <div className="sprint-retro-stat-label mt-1 text-xs font-bold uppercase tracking-wide text-cyan-300">
        {label}
      </div>
    </div>
  );
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
