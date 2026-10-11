"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XMarkIcon,
  CameraIcon,
  PhotoIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function QrScannerModal({ isOpen, onClose, onAttendanceRecorded, users = [] }) {
  const [activeTab, setActiveTab] = useState("camera"); // 'camera' | 'file'
  const [scannerStatus, setScannerStatus] = useState("idle"); // 'idle' | 'starting' | 'scanning' | 'paused' | 'error'
  const [errorMessage, setErrorMessage] = useState("");
  const [scanResult, setScanResult] = useState(null); // { status: 'success' | 'already' | 'error', message, participant }
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [continuousMode, setContinuousMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const html5QrCodeRef = useRef(null);
  const isCooldownRef = useRef(false);
  const containerId = "qr-code-scanner-element";

  // Synthesized Web Audio API beep
  const playBeep = (isSuccess = true) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio might be muted or not allowed without user gesture
    }
  };

  // Process decoded string
  const handleDecodedString = async (decodedText) => {
    if (isCooldownRef.current || isProcessing) return;
    isCooldownRef.current = true;
    setIsProcessing(true);

    try {
      let targetId = "";
      let targetNim = "";
      let targetName = "";

      // Try parsing JSON first
      try {
        const parsed = JSON.parse(decodedText);
        targetId = parsed.id || "";
        targetNim = parsed.nim || "";
        targetName = parsed.nama || "";
      } catch {
        // Plain string fallback
        const trimmed = decodedText.trim();
        targetId = trimmed;
        targetNim = trimmed;
      }

      if (!targetId && !targetNim) {
        throw new Error("QR Code tidak memuat data ID atau NIM yang valid.");
      }

      // Check if user already exists and their status
      const existingUser = users.find(
        (u) =>
          (targetId && u.id === targetId) ||
          (targetNim && u.nim && u.nim.toLowerCase() === targetNim.toLowerCase())
      );

      if (existingUser && existingUser.kehadiran) {
        playBeep(false);
        setScanResult({
          status: "already",
          message: `${existingUser.nama} sudah tercatat HADIR sebelumnya.`,
          participant: existingUser,
        });
      } else {
        // Call API to mark as present
        const res = await fetch("/api/updateAttendance", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: targetId || existingUser?.id,
            nim: targetNim || existingUser?.nim,
            kehadiran: true,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Gagal memperbarui status kehadiran");
        }

        const updatedParticipant = data.user || data;
        playBeep(true);

        setScanResult({
          status: "success",
          message: `Berhasil! ${updatedParticipant.nama} resmi diabsen HADIR.`,
          participant: updatedParticipant,
        });

        if (onAttendanceRecorded) {
          onAttendanceRecorded(updatedParticipant);
        }
      }
    } catch (err) {
      playBeep(false);
      setScanResult({
        status: "error",
        message: err.message || "Data QR Code tidak valid atau peserta tidak ditemukan.",
      });
    } finally {
      setIsProcessing(false);
      // Cooldown of 2 seconds before scanning next QR code
      setTimeout(() => {
        isCooldownRef.current = false;
        if (continuousMode) {
          // Clear notification after a short delay so scanner stays ready
          setTimeout(() => {
            setScanResult((prev) => (prev?.status === "success" ? null : prev));
          }, 3500);
        }
      }, 2000);
    }
  };

  // Start Camera Scanner
  const startCamera = async (cameraIdToUse) => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      // Stop existing instance if running
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch {
          // Ignore clear errors
        }
      }

      setScannerStatus("starting");
      setErrorMessage("");

      const html5QrCode = new Html5Qrcode(containerId);
      html5QrCodeRef.current = html5QrCode;

      // Enumerate cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        const camId = cameraIdToUse || selectedCameraId || devices[0].id;
        if (!selectedCameraId) setSelectedCameraId(camId);

        const config = {
          fps: 12,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          camId,
          config,
          (decodedText) => handleDecodedString(decodedText),
          () => {} // silent scan frame error
        );

        setScannerStatus("scanning");
      } else {
        // Fallback to environment facingMode
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 12, qrbox: { width: 260, height: 260 } },
          (decodedText) => handleDecodedString(decodedText),
          () => {}
        );
        setScannerStatus("scanning");
      }
    } catch (err) {
      console.error("Camera error:", err);
      setScannerStatus("error");
      setErrorMessage(
        err?.message || "Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan."
      );
    }
  };

  // Stop Camera Scanner
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch {
        // Ignore stop error
      }
      html5QrCodeRef.current = null;
    }
    setScannerStatus("idle");
  };

  // Lifecycle when open/close or tab change
  useEffect(() => {
    if (isOpen && activeTab === "camera") {
      // Delay slightly for modal DOM node to mount
      const timer = setTimeout(() => {
        startCamera(selectedCameraId);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  // Handle camera switch
  const handleCameraChange = (e) => {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    stopCamera().then(() => startCamera(newId));
  };

  // Handle File Upload Scan
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setScannerStatus("starting");
      const { Html5Qrcode } = await import("html5-qrcode");
      const tempScanner = new Html5Qrcode("qr-file-scanner-temp");
      const decodedText = await tempScanner.scanFile(file, false);
      tempScanner.clear();
      await handleDecodedString(decodedText);
      setScannerStatus("idle");
    } catch (err) {
      playBeep(false);
      setScanResult({
        status: "error",
        message: "QR Code tidak terbaca pada gambar tersebut. Coba gambar lain yang lebih jelas.",
      });
      setScannerStatus("idle");
    } finally {
      e.target.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative text-slate-900 dark:text-white my-6"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-brand-primary/10 text-brand-primary">
                <CameraIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                  Scan QR Kehadiran
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Arahkan kamera ke tiket QR peserta untuk check-in otomatis
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 pt-4 flex gap-2">
            <button
              onClick={() => setActiveTab("camera")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "camera"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <CameraIcon className="w-4 h-4" />
              <span>Gunakan Kamera</span>
            </button>
            <button
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === "file"
                  ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <PhotoIcon className="w-4 h-4" />
              <span>Unggah Gambar QR</span>
            </button>
          </div>

          {/* Camera / Viewport Area */}
          <div className="p-6 space-y-4">
            {activeTab === "camera" ? (
              <div className="space-y-3">
                {/* Scanner Viewport */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-[320px] mx-auto flex items-center justify-center border-2 border-slate-200 dark:border-slate-800 shadow-inner">
                  <div id={containerId} className="w-full h-full" />

                  {/* Animated laser & corner brackets when scanning */}
                  {scannerStatus === "scanning" && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="w-[230px] h-[230px] border-2 border-brand-primary/60 rounded-2xl relative">
                        {/* Corner markers */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-brand-primary rounded-tl-lg" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-brand-primary rounded-tr-lg" />
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-brand-primary rounded-bl-lg" />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-brand-primary rounded-br-lg" />

                        {/* Scanning Laser Line */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse top-1/2 -translate-y-1/2 absolute" />
                      </div>
                    </div>
                  )}

                  {scannerStatus === "starting" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-slate-300 gap-3">
                      <ArrowPathIcon className="w-8 h-8 animate-spin text-brand-primary" />
                      <span className="text-xs">Menyiapkan Kamera...</span>
                    </div>
                  )}

                  {scannerStatus === "error" && (
                    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-slate-300 gap-3">
                      <ExclamationCircleIcon className="w-10 h-10 text-rose-500" />
                      <p className="text-xs text-rose-200 leading-relaxed">{errorMessage}</p>
                      <button
                        onClick={() => startCamera(selectedCameraId)}
                        className="mt-2 py-2 px-4 rounded-xl bg-brand-primary text-white text-xs font-semibold cursor-pointer"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera selector if multiple cameras available */}
                {cameras.length > 1 && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Kamera:</span>
                    <select
                      value={selectedCameraId}
                      onChange={handleCameraChange}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                    >
                      {cameras.map((cam) => (
                        <option key={cam.id} value={cam.id}>
                          {cam.label || `Kamera ${cam.id.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div id="qr-file-scanner-temp" className="hidden" />
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-primary rounded-2xl p-8 cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40">
                  <PhotoIcon className="w-12 h-12 text-slate-400 mb-3" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Klik untuk memilih file foto QR Code
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Mendukung format PNG, JPG, JPEG, WEBP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Scan Feedback Banner */}
            <AnimatePresence mode="wait">
              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-2xl border text-xs flex items-start gap-3 shadow-sm ${
                    scanResult.status === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
                      : scanResult.status === "already"
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {scanResult.status === "success" && (
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {scanResult.status === "already" && (
                      <InformationCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                    {scanResult.status === "error" && (
                      <ExclamationCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold">{scanResult.message}</p>
                    {scanResult.participant && (
                      <div className="text-[11px] opacity-85 pt-1 space-y-0.5">
                        <p>
                          <strong>Kategori:</strong> {scanResult.participant.status}{" "}
                          {scanResult.participant.prodi && scanResult.participant.prodi !== "-"
                            ? `• ${scanResult.participant.prodi}`
                            : ""}
                        </p>
                        {scanResult.participant.nim && (
                          <p>
                            <strong>NIM:</strong> {scanResult.participant.nim}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Continuous scan mode toggle & status bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={continuousMode}
                  onChange={(e) => setContinuousMode(e.target.checked)}
                  className="rounded text-brand-primary focus:ring-brand-primary"
                />
                <span>Scan Berkelanjutan (Antrean Cepat)</span>
              </label>

              <button
                onClick={() => {
                  setScanResult(null);
                  if (activeTab === "camera") {
                    startCamera(selectedCameraId);
                  }
                }}
                className="text-brand-primary hover:underline font-medium cursor-pointer"
              >
                Reset Scanner
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
