"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Fireflies from "../../components/Fireflies";
import {
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  IdentificationIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CalendarIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  ChevronDownIcon
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
        nim: statusValue === "Umum" || statusValue === "Alumni DKM" ? "" : prev.nim,
        prodi: statusValue === "Umum" || statusValue === "Alumni DKM" ? "" : prev.prodi,
        angkatan: statusValue === "Mahasiswa" ? prev.angkatan : "",
        divisi: statusValue === "Panitia" ? "" : prev.divisi,
        periode: statusValue === "Pengurus DKM" || statusValue === "Alumni DKM" ? `${new Date().getFullYear()}/${new Date().getFullYear() + 1}` : "",
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
          nim: value === "Umum" || value === "Alumni DKM" ? "" : prev.nim,
          prodi: value === "Umum" || value === "Alumni DKM" ? "" : prev.prodi,
          angkatan: value === "Mahasiswa" ? prev.angkatan : "",
          divisi: value === "Panitia" ? "" : prev.divisi,
          periode: value === "Pengurus DKM" || value === "Alumni DKM" ? `${new Date().getFullYear()}/${new Date().getFullYear() + 1}` : "",
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
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/');
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
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  };

  const isAcademicRole = formData.status === "Mahasiswa" || formData.status === "Panitia" || formData.status === "Pengurus DKM";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 sm:p-6 md:p-8 font-['Outfit'] relative overflow-hidden">
      <Fireflies />
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-6xl glass rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10"
      >
        {/* Left Side - Visual Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black relative overflow-hidden flex flex-col p-6 sm:p-8 md:p-12 text-white border-b md:border-b-0 md:border-r border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/15 rounded-full -ml-32 -mb-32 blur-3xl animate-pulse" />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src="/logo_dkm_paramadina.png"
                alt="Logo DKM"
                width={130}
                height={65}
                className="brightness-0 invert opacity-90 mb-8 md:mb-12"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="relative aspect-square w-full max-w-[260px] mx-auto bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10 shadow-inner">
                  <Image
                    src={slide === 0 ? "/ilustrasi_bukber.png" : "/logo_dkm_paramadina.png"}
                    alt={slide === 0 ? "Ilustrasi Maulid" : "Logo DKM Paramadina"}
                    fill
                    className={`object-contain p-4 transition-transform duration-700 hover:scale-105 ${slide === 1 ? 'bg-white rounded-2xl drop-shadow-2xl' : ''}`}
                  />
                </div>

                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {slide === 0 ? "Maulid DKM Paramadina" : "DKM Paramadina"}
                  </h3>
                  <p className="text-neutral-300 text-sm leading-relaxed font-light">
                    &quot;Meneladani Akhlak Rasulullah dengan Menghidupkan Sunnah dalam Kehidupan Mahasiswa&quot;
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-auto pt-8 relative z-10 text-xs font-medium text-white/40 tracking-widest uppercase flex items-center justify-between">
            <span>© {new Date().getFullYear()} DKM Paramadina</span>
            <span className="hidden md:inline-block w-2 h-2 rounded-full bg-emerald-400/80 animate-ping" />
          </div>
        </div>

        {/* Right Side - Form Panel */}
        <div className="md:w-7/12 p-6 sm:p-8 md:p-10 lg:p-12 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex flex-col justify-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-xl mx-auto"
          >
            {/* Header / Navigation */}
            <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="group inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-primary dark:text-slate-400 dark:hover:text-brand-primary transition-all py-1.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  <span>Ganti Kategori</span>
                </button>

                {formData.status && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                    {formData.status === "Umum" ? "Dosen / Umum" : formData.status}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {role ? `Formulir ${role}` : "Formulir Pendaftaran"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Lengkapi formulir di bawah ini dengan data yang benar untuk bergabung.
              </p>
            </motion.div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Row 1: Nama Lengkap (Kiri) & Email (Kanan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field: Nama Lengkap */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      name="nama"
                      autoComplete="name"
                      placeholder="Nama Lengkap Anda"
                      value={formData.nama}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm"
                      required
                    />
                  </div>
                </motion.div>

                {/* Field: Alamat Email */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Alamat Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                      <EnvelopeIcon className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm"
                      required
                    />
                  </div>
                </motion.div>
              </div>

              {/* Row 2: Status Kepesertaan (Kiri) & Program Studi / Periode / Info (Kanan) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field: Status Kepesertaan */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Status Kepesertaan <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                      <UserGroupIcon className="h-5 w-5" />
                    </div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full pl-11 pr-10 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none appearance-none text-slate-900 dark:text-white text-sm shadow-sm cursor-pointer"
                      required
                    >
                      <option value="">Pilih Status</option>
                      <option value="Mahasiswa">Mahasiswa</option>
                      <option value="Umum">Dosen / Umum</option>
                      <option value="Panitia">Panitia</option>
                      <option value="Pengurus DKM">Pengurus DKM</option>
                      <option value="Alumni DKM">Alumni DKM</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                      <ChevronDownIcon className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>

                {/* Kanan Row 2: Program Studi OR Periode OR Info Box */}
                {isAcademicRole ? (
                  <motion.div
                    key="prodi-field"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Program Studi <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                        <AcademicCapIcon className="h-5 w-5" />
                      </div>
                      <select
                        name="prodi"
                        value={formData.prodi}
                        onChange={handleChange}
                        className="w-full pl-11 pr-10 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none appearance-none text-slate-900 dark:text-white text-sm shadow-sm cursor-pointer"
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
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                        <ChevronDownIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.div>
                ) : formData.status === "Alumni DKM" ? (
                  <motion.div
                    key="alumni-periode"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-1.5"
                  >
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Periode Pengurusan <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="periode"
                        placeholder="Contoh: 2022/2023"
                        value={formData.periode}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm"
                        required
                      />
                    </div>
                  </motion.div>
                ) : formData.status === "Umum" ? (
                  <motion.div
                    key="umum-info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs self-end h-[48px]"
                  >
                    <InformationCircleIcon className="w-5 h-5 text-brand-primary shrink-0" />
                    <span className="leading-tight">Kategori Umum tidak memerlukan pengisian NIM & Prodi.</span>
                  </motion.div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs self-end h-[48px]">
                    <InformationCircleIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Pilih status untuk opsi data lanjutan</span>
                  </div>
                )}
              </div>

              {/* Row 3: Conditional fields (Kiri & Kanan Berdampingan) */}
              <AnimatePresence mode="wait">
                {formData.status === "Mahasiswa" && (
                  <motion.div
                    key="mahasiswa-pair"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden pt-1"
                  >
                    {/* NIM (Kiri) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        NIM (Nomor Induk) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                          <IdentificationIcon className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          name="nim"
                          placeholder="Contoh: 121101234"
                          value={formData.nim}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Angkatan (Kanan) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Tahun Angkatan <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={4}
                          name="angkatan"
                          placeholder="Contoh: 2023"
                          value={formData.angkatan}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {formData.status === "Panitia" && (
                  <motion.div
                    key="panitia-pair"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden pt-1"
                  >
                    {/* NIM (Kiri) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        NIM / ID Panitia <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                          <IdentificationIcon className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          name="nim"
                          placeholder="Contoh: 121101234"
                          value={formData.nim}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Divisi (Kanan) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Divisi Kepanitiaan <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                          <BriefcaseIcon className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          name="divisi"
                          placeholder="Contoh: Acara / Logistik"
                          value={formData.divisi}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {formData.status === "Pengurus DKM" && (
                  <motion.div
                    key="pengurus-pair"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden pt-1"
                  >
                    {/* NIM (Kiri) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        NIM / ID Pengurus <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                          <IdentificationIcon className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          name="nim"
                          placeholder="Contoh: 121101234"
                          value={formData.nim}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Periode (Kanan) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Periode Kepengurusan <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-primary transition-colors">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <input
                          type="text"
                          name="periode"
                          placeholder="Contoh: 2024/2025"
                          value={formData.periode}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm shadow-sm"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.01, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitted}
                  className="w-full btn-vibrant disabled:bg-slate-400 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 text-base cursor-pointer"
                >
                  {submitted ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Memproses Pendaftaran...</span>
                    </>
                  ) : (
                    <span>Daftar Sekarang</span>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
