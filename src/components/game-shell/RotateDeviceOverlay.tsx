"use client";

type RotateDeviceOverlayProps = {
  canRequestFullscreen?: boolean;
  isFullscreenActive?: boolean;
  onRequestFullscreen?: () => void;
  onSkipFullscreen?: () => void;
  showFullscreenPrompt?: boolean;
};

export function RotateDeviceOverlay({
  canRequestFullscreen = false,
  isFullscreenActive = false,
  onRequestFullscreen,
  onSkipFullscreen,
  showFullscreenPrompt = false,
}: RotateDeviceOverlayProps) {
  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-[#071018]/94 px-6 text-center text-white">
      <section className="max-w-sm border-2 border-cyan-200/60 bg-black/55 p-6 shadow-[0_0_42px_rgba(34,211,238,0.18)]">
        <div className="mx-auto flex h-16 w-10 rotate-90 items-center justify-center rounded border-2 border-cyan-200/70 text-2xl text-cyan-100">
          ↻
        </div>
        <h2 className="mt-5 text-2xl font-black uppercase tracking-wide text-cyan-100">
          Rotate To Play
        </h2>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-200">
          Codebound needs room for movement, spells, and questionable sprint
          decisions. Turn your phone sideways to enter the arena.
        </p>

        {showFullscreenPrompt ? (
          <div className="mt-5 border border-cyan-300/25 bg-cyan-500/10 p-3">
            <div className="text-sm font-black uppercase tracking-wide text-cyan-100">
              Full Screen?
            </div>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-200">
              This hides the browser chrome and gives the arena more room.
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                className="cursor-pointer border border-cyan-200/70 bg-cyan-400/15 px-3 py-2 text-xs font-black text-cyan-50 transition hover:bg-cyan-300/25 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!canRequestFullscreen || isFullscreenActive}
                onClick={onRequestFullscreen}
              >
                Go Full Screen
              </button>
              <button
                type="button"
                className="cursor-pointer border border-white/20 bg-black/35 px-3 py-2 text-xs font-black text-slate-200 transition hover:border-white/40 hover:bg-white/10"
                onClick={onSkipFullscreen}
              >
                Not Now
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
