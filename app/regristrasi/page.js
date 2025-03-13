"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function FormPage() {
  const [formData, setFormData] = useState({
    nama: "",
    prodi: "",
    nim: "",
    email: "",
    status: "",
    angkatan: "",
    divisi: "",
    periode: "",
  });

  const [slide, setSlide] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status"
        ? {
            nim: value === "Umum" ? "" : prev.nim,
            prodi: value === "Umum" ? "" : prev.prodi, // Tambahkan ini
            angkatan: value === "Mahasiswa" ? prev.angkatan : "",
            divisi: value === "Panitia" ? "" : prev.divisi,
            periode: value === "Pengurus DKM" ? "2025/2026" : "",
          }
        : {}),
    }));
  };

  // Submit form
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    try {
      // Cek apakah NIM sudah ada di database
      if (formData.nim) {
        const checkRes = await fetch(`/api/checkNIM?nim=${formData.nim}`);
        const checkData = await checkRes.json();

        if (checkData.exists) {
          toast.error("NIM sudah terdaftar! Gunakan NIM lain.");
          setSubmitted(false);
          return; // Hentikan proses jika NIM sudah ada
        }
      }

      // Jika NIM belum ada, lanjutkan proses submit
      const res = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Pendaftaran berhasil! Email konfirmasi terkirim.");
        setFormData({
          nama: "",
          prodi: "",
          nim: "",
          email: "",
          status: "",
          angkatan: "",
          divisi: "",
          periode: "",
        });

        setTimeout(() => {
          setSubmitted(false);
          router.push("/countdown");
        }, 2000);
      } else {
        toast.error(data.error || "Terjadi kesalahan.");
        setSubmitted(false);
      }
    } catch (error) {
      toast.error("Gagal mengirim permintaan.");
      setSubmitted(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-12 bg-blue-300">
      <Toaster position="top-center" />
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-gray-800 text-white rounded-2xl shadow-xl overflow-hidden">
        <motion.div
          className="md:w-1/2 p-10 bg-blue-200 flex flex-col justify-center items-center text-center relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }} // Slow transition for opacity
        >
          <div className="absolute top-4 left-4">
            <Image
              src="/logo_dkm_paramadina.png"
              alt="Logo DKM"
              width={80}
              height={40}
            />
          </div>
          <motion.div
            key={slide}
            className="w-full flex flex-col justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 2, // Slow transition for opacity change
              ease: "easeInOut",
            }}
          >
            {slide === 0 ? (
              <>
                <Image
                  src="/ilustrasi_bukber.png"
                  alt="Buka Bersama"
                  width={700}
                  height={700}
                  className="rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl h-auto"
                />
                <h6 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 mt-4 text-center">
                  Melangkah Bersama Cahaya Quran
                </h6>
                <p className="text-gray-500 text-sm sm:text-base text-center">
                  NAEEMA DKM Paramadina
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900 mt-4 text-center">
                  Buka Bersama DKM Paramadina
                </h2>
                <p className="text-gray-700 text-sm sm:text-base md:text-lg text-center">
                  Melangkah Bersama Cahaya Quran adalah acara buka bersama yang
                  mengajak peserta untuk memperdalam pemahaman Al-Quran dan
                  mempererat ukhuwah di bulan Ramadan.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="md:w-1/2 p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }} // Slow transition for opacity
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Form Pendaftaran
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nama"
              placeholder="Nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
              required
            />
            {formData.status !== "Umum" && (
              <select
                name="prodi"
                value={formData.prodi}
                onChange={handleChange}
                className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
                required
              >
                <option value="">Pilih Program Studi</option>
                <option value="Manajemen dan Bisnis">
                  Manajemen dan Bisnis
                </option>
                <option value="Desain Komunikasi Visual">
                  Desain Komunikasi Visual
                </option>
                <option value="Teknik Informatika">Teknik Informatika</option>
                <option value="Desain Produk">Desain Produk</option>
                <option value="Falsafah dan Agama">Falsafah dan Agama</option>
                <option value="Hubungan Internasional">
                  Hubungan Internasional
                </option>
                <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
                <option value="Psikologi">Psikologi</option>
              </select>
            )}

            {formData.status !== "Umum" && (
              <input
                type="text"
                name="nim"
                placeholder="NIM"
                value={formData.nim}
                onChange={handleChange}
                className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
                required={formData.status !== "Umum"}
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
              required
            />
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
              required
            >
              <option value="">Pilih Status</option>
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Umum">Umum</option>
              <option value="Panitia">Panitia</option>
              <option value="Pengurus DKM">Pengurus DKM</option>
            </select>
            {formData.status === "Mahasiswa" && (
              <input
                type="text"
                name="angkatan"
                placeholder="Angkatan"
                value={formData.angkatan}
                onChange={handleChange}
                className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
                required
              />
            )}
            {formData.status === "Panitia" && (
              <input
                type="text"
                name="divisi"
                placeholder="Divisi"
                value={formData.divisi}
                onChange={handleChange}
                className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
                required
              />
            )}
            {formData.status === "Pengurus DKM" && (
              <input
                type="text"
                name="periode"
                placeholder="Periode"
                value={formData.periode}
                onChange={handleChange}
                className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
                required
              />
            )}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }} // Smooth and slow tap effect
              className="w-full bg-blue-600 text-white p-4 rounded-lg"
            >
              {submitted ? "Terkirim ✅" : "Simpan"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
