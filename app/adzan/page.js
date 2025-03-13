"use client";

import { useEffect } from "react";

export default function AdzanPage() {
  useEffect(() => {
    const audio = new Audio("/adzan.mp3");
    audio.loop = false;
    audio.play().catch(err => console.error("Gagal memutar adzan:", err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h2 className="text-xl font-bold">Adzan Sedang Berkumandang...</h2>
    </div>
  );
}
