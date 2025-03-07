"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(120);
  const [audioAllowed, setAudioAllowed] = useState(false);
  const [notificationAllowed, setNotificationAllowed] = useState(false);

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
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      if (audioAllowed) {
        const audio = new Audio("/adzan.mp3");
        audio.play().catch(err => console.error("Gagal memutar adzan:", err));
      }

      if (notificationAllowed) {
        new Notification("Waktunya Berbuka!", {
          body: "Selamat Berbuka Puasa! Semoga puasamu diterima.",
          icon: "/logo_dkm_paramadina.png",
        });
      }
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [audioAllowed, notificationAllowed]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 text-center relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/mosque-bg.png')] bg-cover bg-center opacity-20"></div>
      
      <h1 className="text-4xl font-extrabold drop-shadow-lg">Undangan Buka Bersama</h1>
      <div className="mt-4 p-4 bg-white text-black rounded-xl shadow-lg w-80 text-center">
        <p className="text-lg font-semibold">📅 Tanggal: <span className="text-blue-600">15 Maret 2025</span></p>
        <p className="text-lg font-semibold">⏰ Waktu: <span className="text-blue-600">18:00 WIB</span></p>
        <p className="text-lg font-semibold">📍 Lokasi: <span className="text-blue-600">Masjid DKM Paramadina</span></p>
      </div>
      
      <h2 className="text-3xl font-bold mt-6 drop-shadow-md">Hitung Mundur Berbuka Puasa</h2>
      <div className="flex space-x-4 mt-4 text-5xl font-extrabold bg-white text-blue-600 px-6 py-3 rounded-lg shadow-lg">
        <div>{String(Math.floor(timeLeft / 60)).padStart(2, '0')}</div>
        <span>:</span>
        <div>{String(timeLeft % 60).padStart(2, '0')}</div>
      </div>

      {!audioAllowed && (
        <button 
          onClick={() => setAudioAllowed(true)} 
          className="mt-6 bg-green-500 text-white py-3 px-8 rounded-lg shadow-lg text-lg font-semibold hover:scale-105 transition transform"
        >
          Aktifkan Adzan
        </button>
      )}
    </div>
  );
}