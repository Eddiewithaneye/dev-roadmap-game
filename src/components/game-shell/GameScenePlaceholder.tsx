import { PlaceholderPlayer } from "./PlaceholderPlayer";

export function GameScenePlaceholder() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_center,#143b4a_0%,#071018_65%)]">
      <div className="absolute inset-x-0 top-[55%] h-px bg-cyan-200/15" />
      <PlaceholderPlayer />
    </section>
  );
}
