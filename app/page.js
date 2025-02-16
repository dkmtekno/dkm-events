"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";

export default function FormPage() {
  const [formData, setFormData] = useState({
    nama: "",
    prodi: "",
    nim: "",
    status: "",
    angkatan: "",
    divisi: "",
    periode: "",
  });

  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status"
        ? {
            nim: value === "Dosen" ? "" : prev.nim,
            angkatan: value === "Mahasiswa" ? "" : "",
            divisi: value === "Panitia" ? "" : "",
            periode: value === "Anggota DKM" ? "" : "",
          }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/form/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Data berhasil disimpan!");
        setFormData({
          nama: "",
          prodi: "",
          nim: "",
          status: "",
          angkatan: "",
          divisi: "",
          periode: "",
        });
      } else {
        toast.error("Gagal menyimpan data.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan, coba lagi.");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-6 py-12 bg-blue-300"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      <Toaster position="top-center" />
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-gray-800 text-white rounded-2xl shadow-xl overflow-hidden">
        {/* Bagian Kiri - Slide Show */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="md:w-1/2 p-10 bg-blue-200 flex flex-col justify-center items-center text-center relative"
        >
          <div className="absolute top-4 left-4">
            <Image src="/logo_dkm_paramadina.png" alt="Logo DKM" width={80} height={40} />
          </div>

          <motion.div
            key={slide}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-full flex flex-col justify-center items-center"
          >
            {slide === 0 ? (
              <>
                <Image src="/Ilustrasi_Isra_Miraj.png" alt="Isra Miraj" width={250} height={250} className="rounded-lg" />
                <h2 className="text-3xl font-bold mb-3 text-gray-900 mt-4">Isra Miraj 1445H</h2>
                <p className="text-gray-800 text-lg">Mari bersama meraih keberkahan dalam acara spesial ini. Daftar sekarang!</p>
              </>
            ) : (
              <Image src="/logo_dkm_paramadina.png" alt="Logo Tengah" width={200} height={100} />
            )}
          </motion.div>
        </motion.div>

        {/* Bagian Kanan - Form */}
        <motion.div
          initial={{ x: 150, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="md:w-1/2 p-10"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Form Pendaftaran</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nama"
              placeholder="Nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full p-2 md:p-4 text-base md:text-lg rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="text"
              name="prodi"
              placeholder="Prodi"
              value={formData.prodi}
              onChange={handleChange}
              className="w-full p-2 md:p-4 text-base md:text-lg rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            {formData.status !== "Dosen" && (
              <input
                type="text"
                name="nim"
                placeholder="NIM"
                value={formData.nim}
                onChange={handleChange}
                className="w-full p-2 md:p-4 text-base md:text-lg rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 md:p-4 text-base md:text-lg rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Status</option>
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Dosen">Dosen</option>
              <option value="Panitia">Panitia</option>
              <option value="Anggota DKM">Anggota DKM</option>
            </select>

            {formData.status === "Mahasiswa" && (
              <input
                type="text"
                name="angkatan"
                placeholder="Angkatan"
                value={formData.angkatan}
                onChange={handleChange}
                className="w-full p-2 md:p-4 text-base md:text-lg rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              className="w-full bg-blue-600 text-white p-2 md:p-4 text-base md:text-lg rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Simpan
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
