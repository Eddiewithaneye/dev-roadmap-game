"use client";

export function RotateDeviceOverlay() {
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
      </section>
    </div>
  );
}
