"use client";

type MobileFullscreenPromptProps = {
  canRequestFullscreen: boolean;
  onRequestFullscreen: () => void;
  onSkipFullscreen: () => void;
};

export function MobileFullscreenPrompt({
  canRequestFullscreen,
  onRequestFullscreen,
  onSkipFullscreen,
}: MobileFullscreenPromptProps) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-[#071018]/82 px-6 text-center text-white">
      <section className="max-w-sm border-2 border-cyan-200/60 bg-black/70 p-5 shadow-[0_0_42px_rgba(34,211,238,0.18)]">
        <div className="text-sm font-black uppercase tracking-wide text-cyan-100">
          Full Screen?
        </div>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-200">
          Codebound plays best with the browser bars tucked away.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            className="cursor-pointer border border-cyan-200/70 bg-cyan-400/15 px-4 py-2 text-sm font-black text-cyan-50 transition hover:bg-cyan-300/25 disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!canRequestFullscreen}
            onClick={onRequestFullscreen}
          >
            Go Full Screen
          </button>
          <button
            type="button"
            className="cursor-pointer border border-white/20 bg-black/35 px-4 py-2 text-sm font-black text-slate-200 transition hover:border-white/40 hover:bg-white/10"
            onClick={onSkipFullscreen}
          >
            Not Now
          </button>
        </div>
      </section>
    </div>
  );
}
