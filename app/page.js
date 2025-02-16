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
            nim: value === "Dosen" ? "" : prev.nim,
            angkatan: value === "Mahasiswa" ? prev.angkatan : "",
            divisi: value === "Panitia" ? "" : prev.divisi,
            periode: value === "Anggota DKM" ? "" : prev.periode,
          }
        : {}),
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    try {
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
        setTimeout(() => setSubmitted(false), 2000);
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
                  src="/Ilustrasi_Isra_Miraj.png"
                  alt="Isra Miraj"
                  width={250}
                  height={250}
                  className="rounded-lg"
                />
                <h2 className="text-3xl font-bold mb-3 text-gray-900 mt-4">
                  Isra Miraj 1445H
                </h2>
                <p className="text-gray-800 text-lg">
                  Mari bersama meraih keberkahan dalam acara spesial ini. Daftar
                  sekarang!
                </p>
              </>
            ) : (
              <Image
                src="/logo_dkm_paramadina.png"
                alt="Logo Tengah"
                width={200}
                height={100}
              />
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="md:w-1/2 p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }} // Slow transition for opacity
        >
          <h2 className="text-3xl font-bold text-center mb-8">Form Pendaftaran</h2>
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
            <input
              type="text"
              name="prodi"
              placeholder="Prodi"
              value={formData.prodi}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
              required
            />
            {formData.status !== "Dosen" && (
              <input
                type="text"
                name="nim"
                placeholder="NIM"
                value={formData.nim}
                onChange={handleChange}
                className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600"
                required={formData.status !== "Dosen"}
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
            {formData.status === "Anggota DKM" && (
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
