"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type ModeKey = "sprint" | "waterfall";

const MODES: Array<{
  key: ModeKey;
  title: string;
  subtitle: string;
  description: string[];
  href: string;
  accentClass: string;
}> = [
  {
    key: "sprint",
    title: "Sprint",
    subtitle: "Campaign Mode",
    description: [
      "Saving the world can be a bit overwhelming, so just tackle it one slice at a time.",
      "You'll start out with Sprint Planning, and then kick as much techno-booty as you can before the end of the Sprint.",
      "Don't forget to have a Sprint Retro afterwards! Reflecting back is how you grow as a Coder.",
    ],
    href: "/game?mode=sprint",
    accentClass: "border-cyan-300/65 text-cyan-100 shadow-cyan-500/20",
  },
  {
    key: "waterfall",
    title: "Waterfall",
    subtitle: "Endless Mode",
    description: [
      "Do you hate stopping when you have momentum? Great news: planning has been completed for you.",
      "No sprints. No small chunks. Just keep going until something breaks irreparably, probably your soul.",
      "Upper management says it will ship soon. Welcome to Forever.",
    ],
    href: "/game?mode=waterfall",
    accentClass: "border-[#d380ec]/80 text-[#f4d7ff] shadow-[#d380ec]/35",
  },
];

export function ModeDoorSelect() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<ModeKey | null>(null);

  useEffect(() => {
    if (selectedMode) {
      document.documentElement.dataset.homeTransition = "active";
      return;
    }

    delete document.documentElement.dataset.homeTransition;
  }, [selectedMode]);

  function selectMode(mode: (typeof MODES)[number]) {
    if (selectedMode) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedMode(mode.key);
    window.setTimeout(() => router.push(mode.href), 1280);
  }

  return (
    <section className="relative flex min-h-0 w-full flex-1 flex-col justify-center overflow-hidden border-y border-cyan-300/20 bg-[#071018] px-5 py-4 text-white sm:py-5">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/backgrounds/code-campus.png')" }}
      />
      <div className="absolute inset-0 bg-[#071018]/70" />
      <div className="absolute inset-x-0 top-0 h-24 bg-cyan-400/10" />
      <div
        className={`codebound-loading-backdrop pointer-events-none fixed inset-0 z-40 transition duration-500 ${
          selectedMode ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative mx-auto flex w-full max-w-6xl -translate-y-10 flex-col gap-5 ${
          selectedMode ? "z-50" : "z-10"
        }`}
      >
        <div className="text-center">
          <div
            className={`transition duration-1000 ease-out ${
              selectedMode
                ? "translate-y-8 scale-122 opacity-100"
                : "translate-y-0 scale-100 opacity-100"
            }`}
          >
            <Image
              alt="Codebound"
              className="mx-auto h-auto w-full max-w-[520px] sm:max-w-[680px] lg:max-w-[850px]"
              height={1344}
              priority
              src="/images/codebound-logo.png"
              width={3168}
            />
          </div>
          
          <div
            className={`mx-auto mt-2 max-w-2xl text-base font-semibold leading-7 text-slate-200 transition duration-500 sm:-mt-10 sm:text-lg ${
              selectedMode ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100"
            }`}
          >
            <p>
              In a world where code is magic, you&apos;ll face bugs, logical
              errors, and contrived learning projects as you prepare to face the
              biggest challenge of all:
            </p>
            <p className="font-black text-cyan-100">
              Tech Recruiters
            </p>
            <h1 className="text-2xl font-black uppercase tracking-wide text-white sm:mt-2 sm:text-xl lg:text-[2.75rem]">
              Choose Your Path
            </h1>
          </div>
          
        </div>

        <div
          className={`mode-door-grid grid gap-4 transition duration-500 lg:grid-cols-2 ${
            selectedMode ? "translate-y-8 scale-95 opacity-0" : "translate-y-0 scale-100 opacity-100"
          }`}
        >
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.key;
            const isOtherSelected = selectedMode && !isSelected;

            return (
              <button
                key={mode.key}
                type="button"
                className={`mode-door-card group relative min-h-[280px] cursor-pointer overflow-hidden border-2 bg-black/62 p-4 text-left shadow-[0_0_42px_var(--tw-shadow-color)] transition duration-500 hover:-translate-y-1 hover:bg-black/72 sm:min-h-[300px] sm:p-5 ${mode.accentClass} ${
                  isSelected ? "z-20 scale-110 opacity-100" : ""
                } ${isOtherSelected ? "translate-y-8 scale-90 opacity-0" : ""}`}
                onClick={() => selectMode(mode)}
              >
                <div className="absolute inset-x-8 top-0 h-8 bg-current opacity-10 blur-xl transition group-hover:opacity-20" />
                <div className="absolute inset-x-12 bottom-0 h-20 bg-current opacity-10 blur-2xl" />

                <div
                  className={`relative flex h-full flex-col ${
                    mode.key === "waterfall" ? "justify-start gap-4" : "justify-between"
                  }`}
                >
                  <div>
                    <div className="mode-door-subtitle text-sm font-bold uppercase tracking-[0.22em] opacity-80">
                      {mode.subtitle}
                    </div>
                    <div className="mode-door-title mt-3 text-5xl font-black uppercase text-white sm:text-6xl">
                      {mode.title}
                    </div>
                  </div>

                  <div className="mode-door-copy grid gap-3 border border-white/10 bg-black/40 p-3 text-sm font-semibold leading-6 text-slate-200">
                    {mode.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedMode ? (
        <div className="home-transition-loading pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="h-32 w-32 animate-ping rounded-full bg-cyan-200/20" />
          <div className="absolute text-2xl bottom-16.5 font-black uppercase tracking-[0.3em] text-cyan-50">
            Loading
          </div>
        </div>
      ) : null}
    </section>
  );
}
