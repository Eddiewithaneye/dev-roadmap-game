"use client";

import { useEffect, useState } from "react";

export function ProfileApiTest() {
  const [result, setResult] = useState<string>("Loading profile...");

  useEffect(() => {
    async function loadProfile() {
      const response = await fetch("/api/player/profile");
      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
    }

    void loadProfile();
  }, []);

  return (
    <pre className="whitespace-pre-wrap border border-cyan-300/30 bg-black/50 p-3 text-xs text-cyan-100">
      {result}
    </pre>
  );
}