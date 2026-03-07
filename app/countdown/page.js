"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function CountdownTimer() {
  const targetTime = new Date("2025-03-21T18:06:00").getTime();
  const [timeLeft, setTimeLeft] = useState(targetTime - Date.now());
  const [audioAllowed, setAudioAllowed] = useState(false);
  const [notificationAllowed, setNotificationAllowed] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    if (Notification.permission === "granted") {
      setNotificationAllowed(true);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setNotificationAllowed(true);
        }
      });
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remainingTime = targetTime - now;
      setTimeLeft(remainingTime > 0 ? remainingTime : 0);

      if (remainingTime <= 0) {
        clearInterval(interval);

        if (audioAllowed) {
          const audio = new Audio("/adzan.mp3");
          audio.play().catch((err) => console.error("Gagal memutar adzan:", err));
        }

        if (notificationAllowed) {
          new Notification("Waktunya Berbuka!", {
            body: "Selamat Berbuka Puasa! Semoga puasamu diterima.",
            icon: "/logo_dkm_paramadina.png",
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [audioAllowed, notificationAllowed, targetTime]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { days, hours, minutes, seconds };
  };

  const { days, hours, minutes, seconds } = formatTime(timeLeft);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();

    const x = ((clientX - left) / width - 0.5) * 30;
    const y = ((clientY - top) / height - 0.5) * -30;

    setTilt({ rotateX: y, rotateY: x });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 text-center relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/buka_puasa.png')] bg-cover bg-center opacity-20"></div>

      <h1 className="text-1xl md:text-4xl font-extrabold drop-shadow-xl text-blue-300">
        🌙 Buka Puasa Bersama 🌙
      </h1>

      <motion.div
        className="mt-5 p-4 bg-black bg-opacity-50 text-white rounded-lg shadow-lg w-full max-w-lg text-left border border-blue-400"
        animate={tilt}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      >
        <p className="flex items-center gap-2 text-lg font-semibold">📅 <span className="text-blue-400">Jumat, 21 Maret {new Date().getFullYear()}</span></p>
        <p className="flex items-center gap-2 text-lg font-semibold mt-2">⏰ <span className="text-blue-400">15:30 WIB - Selesai</span></p>
        <p className="flex items-center gap-2 text-lg font-semibold mt-2">📍 <span className="text-blue-400">Aula Gedung C</span></p>
      </motion.div>

      <h2 className="text-2xl md:text-3xl font-bold mt-6 drop-shadow-md text-blue-300">Hitung Mundur Berbuka</h2>

      <motion.div
        className="flex justify-center items-center gap-4 md:gap-6 mt-4 text-lg md:text-2xl font-bold text-blue-400 bg-black bg-opacity-50 px-5 py-3 rounded-xl shadow-md border border-blue-500 w-full max-w-lg"
        animate={tilt}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
        style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      >
        <div className="flex flex-col items-center">
          <span className="neon-glow">{String(days).padStart(2, "0")}</span>
          <p className="text-xs md:text-sm text-gray-300">Hari</p>
        </div>
        <span className="text-blue-500 text-xl md:text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="neon-glow">{String(hours).padStart(2, "0")}</span>
          <p className="text-xs md:text-sm text-gray-300">Jam</p>
        </div>
        <span className="text-blue-500 text-xl md:text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="neon-glow">{String(minutes).padStart(2, "0")}</span>
          <p className="text-xs md:text-sm text-gray-300">Menit</p>
        </div>
        <span className="text-blue-500 text-xl md:text-2xl">:</span>
        <div className="flex flex-col items-center">
          <span className="neon-glow">{String(seconds).padStart(2, "0")}</span>
          <p className="text-xs md:text-sm text-gray-300">Detik</p>
        </div>
      </motion.div>

      {!audioAllowed && (
        <button onClick={() => setAudioAllowed(true)} className="mt-5 bg-blue-500 text-white py-2 px-5 md:py-3 md:px-6 rounded-lg shadow-lg text-sm md:text-base font-semibold hover:scale-105 transition transform">
          🔊 Aktifkan Adzan
        </button>
      )}
    </div>
  );
}
