"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  IdentificationIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";

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
  const router = useRouter();

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);

      const statusValue = storedRole === "Dosen/Umum" ? "Umum" : storedRole;

      setFormData((prev) => ({
        ...prev,
        status: statusValue,
        nim: statusValue === "Umum" ? "" : prev.nim,
        prodi: statusValue === "Umum" ? "" : prev.prodi,
        angkatan: statusValue === "Mahasiswa" ? prev.angkatan : "",
        divisi: statusValue === "Panitia" ? "" : prev.divisi,
        periode: statusValue === "Pengurus DKM" ? `${new Date().getFullYear()}/${new Date().getFullYear() + 1}` : "",
      }));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlide((prev) => (prev === 0 ? 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status"
        ? {
          nim: value === "Umum" ? "" : prev.nim,
          prodi: value === "Umum" ? "" : prev.prodi,
          angkatan: value === "Mahasiswa" ? prev.angkatan : "",
          divisi: value === "Panitia" ? "" : prev.divisi,
          periode: value === "Pengurus DKM" ? `${new Date().getFullYear()}/${new Date().getFullYear() + 1}` : "",
        }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    try {
      if (formData.nim) {
        const checkRes = await fetch(`/api/checkNIM?nim=${formData.nim}`);
        const checkData = await checkRes.json();

        if (checkData.exists) {
          toast.error("NIM sudah terdaftar! Gunakan NIM lain.");
          setSubmitted(false);
          return;
        }
      }

      const res = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
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

        MySwal.fire({
          title: "Terima Kasih 🎉",
          text: "Pendaftaran kamu berhasil!",
          icon: "success",
          confirmButtonText: "Selesai",
          customClass: {
            confirmButton: 'bg-brand-primary px-8 py-3 rounded-full text-white font-semibold'
          }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-8 font-['Outfit']">
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl glass rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
      >
        {/* Left Side - Visual Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-neutral-900 to-black relative overflow-hidden flex flex-col p-8 md:p-12 text-white border-r border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/20 rounded-full -ml-32 -mb-32 blur-3xl animate-pulse" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="/logo_dkm_paramadina.png"
                alt="Logo DKM"
                width={120}
                height={60}
                className="brightness-0 invert opacity-90 mb-12"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="relative aspect-square w-full max-w-[280px] mx-auto bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <Image
                    src={slide === 0 ? "/ilustrasi_bukber.png" : "/logo_dkm_paramadina.png"}
                    alt={slide === 0 ? "Ilustrasi Buka Bersama" : "Logo DKM Paramadina"}
                    fill
                    className={`object-contain p-4 transition-transform duration-700 hover:scale-105 ${slide === 1 ? 'bg-white rounded-2xl drop-shadow-2xl' : ''}`}
                  />
                </div>

                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {slide === 0 ? "Buka Bersama DKM Paramadina" : "DKM Paramadina"}
                  </h3>
                  <p className="text-neutral-300 leading-relaxed font-light">
                    "Meneladani Akhlak Rasulullah dengan Menghidupkan Sunnah dalam Kehidupan Mahasiswa"
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-auto pt-12 relative z-10 text-xs font-medium text-white/50 tracking-widest uppercase">
            © {new Date().getFullYear()} DKM Paramadina
          </div>
        </div>

        {/* Right Side - Form Panel */}
        <div className="md:w-7/12 p-8 md:p-16 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {role ? `Halo, ${role}!` : "Daftar Event"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Silakan lengkapi data diri Anda untuk melanjutkan pendaftaran.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                </div>
                <input
                  type="text"
                  name="nama"
                  placeholder="Nama Lengkap"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Alamat Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserGroupIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                </div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none appearance-none text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Pilih Status</option>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Umum">Dosen / Umum</option>
                  <option value="Panitia">Panitia</option>
                  <option value="Pengurus DKM">Pengurus DKM</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </motion.div>

              <AnimatePresence>
                {formData.status !== "Umum" && formData.status !== "" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <AcademicCapIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                      </div>
                      <select
                        name="prodi"
                        value={formData.prodi}
                        onChange={handleChange}
                        className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none appearance-none text-slate-900 dark:text-white"
                        required
                      >
                        <option value="">Pilih Program Studi</option>
                        <option value="Manajemen dan Bisnis">Manajemen dan Bisnis</option>
                        <option value="Desain Komunikasi Visual">Desain Komunikasi Visual</option>
                        <option value="Teknik Informatika">Teknik Informatika</option>
                        <option value="Desain Produk">Desain Produk</option>
                        <option value="Falsafah dan Agama">Falsafah dan Agama</option>
                        <option value="Hubungan Internasional">Hubungan Internasional</option>
                        <option value="Ilmu Komunikasi">Ilmu Komunikasi</option>
                        <option value="Psikologi">Psikologi</option>
                      </select>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <IdentificationIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                      </div>
                      <input
                        type="text"
                        name="nim"
                        placeholder="NIM / ID Member"
                        value={formData.nim}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {formData.status === "Mahasiswa" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="relative group overflow-hidden"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="angkatan"
                      placeholder="Angkatan (Contoh: 2023)"
                      value={formData.angkatan}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white"
                      required
                    />
                  </motion.div>
                )}

                {formData.status === "Panitia" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="relative group overflow-hidden"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <BriefcaseIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="divisi"
                      placeholder="Divisi Kepanitiaan"
                      value={formData.divisi}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white"
                      required
                    />
                  </motion.div>
                )}

                {formData.status === "Pengurus DKM" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="relative group overflow-hidden"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="periode"
                      placeholder="Periode Pengurusan"
                      value={formData.periode}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.01, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitted}
                className="w-full btn-vibrant disabled:bg-slate-400 text-white font-semibold py-4 rounded-xl shadow-lg transition-all mt-6 flex items-center justify-center space-x-2"
              >
                {submitted ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Daftar Sekarang</span>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
