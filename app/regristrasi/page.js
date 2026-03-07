"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [role, setRole] = useState("");
  const MySwal = withReactContent(Swal);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
      
      // Map "Dosen/Umum" to "Umum" to match the select option value
      const statusValue = storedRole === "Dosen/Umum" ? "Umum" : storedRole;
      
      setFormData((prev) => ({
        ...prev,
        status: statusValue,
        // Pre-fill fields that depend on status
        nim: statusValue === "Umum" ? "" : prev.nim,
        prodi: statusValue === "Umum" ? "" : prev.prodi,
        angkatan: statusValue === "Mahasiswa" ? prev.angkatan : "",
        divisi: statusValue === "Panitia" ? "" : prev.divisi,
        periode: statusValue === "Pengurus DKM" ? "2025/2026" : "",
      }));
    }
  }, []);

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
          return;
        }
      }

      // Submit data
      const res = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Reset form
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

        setSubmitted(false);

        // Tampilkan SweetAlert
        MySwal.fire({
          title: "Terima Kasih 🎉",
          text: "Pendaftaran kamu berhasil!",
          icon: "success",
          confirmButtonText: "OK",
        });
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
    <motion.div
      initial={{ opacity: 1 }}
      animate={isRedirecting ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1 }}
    >
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
                  <p className="text-blue-500 mt-3 font-bold text-sm sm:text-base text-center">
                    Maulid Nabi Muhammad SAW
                  </p>
                  <span className="text-xs font-semibold text-blue-900 mt-2 text-center">
                    "Meneladani Akhlak Rasulullah dengan Menghidupkan Sunnah
                    dalam Kehidupan Mahasiswa"
                  </span>
                </>
              ) : (
                <>
                  <Image
                    src="/ilustrasi_bukber.png"
                    alt="Buka Bersama"
                    width={700}
                    height={700}
                    className="rounded-lg w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl h-auto"
                  />
                  <p className="text-blue-500 mt-3 font-bold text-sm sm:text-base text-center">
                    Naeema DKM Paramadina
                  </p>
                  <span className="text-xs font-semibold text-blue-900 mt-2 text-center">
                    "Meneladani Akhlak Rasulullah dengan Menghidupkan Sunnah
                    dalam Kehidupan Mahasiswa"
                  </span>
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
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              {role ? `Selamat Datang ${role}` : "Form Pendaftaran"}
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
                <option value="Umum">Dosen/Umum</option>
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
    </motion.div>
  );
}
