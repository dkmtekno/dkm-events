"use client";

import Image from "next/image";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Fireflies from "../components/Fireflies";
import {
  ArrowRightIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  BuildingLibraryIcon,
  IdentificationIcon
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [sisaKuota, setSisaKuota] = useState(50);

  useEffect(() => {
    const checkParticipants = async () => {
      try {
        const response = await fetch("/api/form");
        if (!response.ok) throw new Error("Gagal mengambil data");

        const data = await response.json();
        const totalKuota = 70;
        const pesertaCount = data.length;
        const sisaKuota = Math.max(0, totalKuota - pesertaCount);

        setSisaKuota(sisaKuota);

        if (pesertaCount >= totalKuota) {
          setIsClosed(true);
          Swal.fire({
            title: "Pendaftaran Ditutup!",
            text: "Kuota sudah penuh. Tidak bisa menerima pendaftaran lagi.",
            icon: "error",
            confirmButtonText: "Oke",
            customClass: {
              confirmButton: 'bg-brand-primary px-8 py-3 rounded-full text-white font-semibold'
            }
          });
        } else if (sisaKuota <= 10) {
          Swal.fire({
            title: "Kuota Hampir Habis!",
            text: `Sisa kuota tinggal ${sisaKuota} orang. Daftar segera!`,
            icon: "warning",
            confirmButtonText: "Mengerti",
            customClass: {
              confirmButton: 'bg-brand-primary px-8 py-3 rounded-full text-white font-semibold'
            }
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data peserta:", error);
      }
    };

    checkParticipants();
  }, []);

  if (isClosed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-slate-50 dark:bg-slate-950 font-['Outfit']">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-3xl max-w-md shadow-2xl"
        >
          <Image
            src="/kucing_sedih.gif"
            alt="Pendaftaran Ditutup"
            width={180}
            height={180}
            priority
            className="w-40 sm:w-48 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            😢 Pendaftaran Ditutup...
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Maaf sekali, kuota sudah penuh. Kami tidak bisa menerima pendaftaran lagi.
          </p>
          <p className="text-brand-primary font-medium italic">
            Semoga kita bisa bertemu di kesempatan berikutnya... 💔
          </p>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 md:p-12 font-['Outfit'] relative overflow-hidden">
      <Fireflies />

      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-primary/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <Image
              src="/logo_dkm_paramadina.png"
              alt="Logo"
              width={180}
              height={60}
              className="dark:brightness-0 dark:invert"
            />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4"
          >
            Selamat Datang
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto"
          >
            Silakan pilih kategori pendaftaran untuk bergabung dalam event kami.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <LoginCard
            title="Mahasiswa"
            description="Mahasiswa aktif Universitas Paramadina"
            icon={<AcademicCapIcon className="w-8 h-8" />}
            setIsTransitioning={setIsTransitioning}
          />
          <LoginCard
            title="Dosen/Umum"
            description="Dosen, Staff, atau Peserta dari luar kampus"
            icon={<GlobeAltIcon className="w-8 h-8" />}
            setIsTransitioning={setIsTransitioning}
          />
          <LoginCard
            title="Pengurus DKM"
            description="Fungsionaris DKM Paramadina aktif"
            icon={<BuildingLibraryIcon className="w-8 h-8" />}
            setIsTransitioning={setIsTransitioning}
          />
          <LoginCard
            title="Panitia"
            description="Panitia penyelenggara event"
            icon={<ClipboardDocumentListIcon className="w-8 h-8" />}
            setIsTransitioning={setIsTransitioning}
          />
          <div className="sm:col-span-2 flex justify-center mt-2">
            <div className="w-full sm:w-1/2">
              <LoginCard
                title="Alumni DKM"
                description="Alumni DKM Universitas Paramadina"
                icon={<IdentificationIcon className="w-8 h-8" />}
                setIsTransitioning={setIsTransitioning}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-primary/5 border border-brand-primary/10 text-brand-primary font-medium text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
            </span>
            <span>Sisa kuota pendaftaran: <strong>{sisaKuota}</strong> orang</span>
          </div>

          <p className="text-slate-400 text-sm mt-8">
            © {new Date().getFullYear()} DKM Paramadina • Powered by Digital Teknologi DKM
          </p>
        </motion.div>
      </motion.div>

      {/* Overlay "Mengarahkan..." */}
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-md z-50 w-screen h-screen"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Mengarahkan...</h2>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function LoginCard({ title, description, icon, setIsTransitioning }) {
  const router = useRouter();

  const handleClick = () => {
    setIsTransitioning(true);
    sessionStorage.setItem("role", title);

    setTimeout(() => {
      router.push("/regristrasi");
    }, 800);
  };

  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="group glass p-8 rounded-3xl cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all flex items-start space-x-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowRightIcon className="w-5 h-5 text-brand-primary" />
      </div>

      <div className="w-16 h-16 flex items-center justify-center bg-brand-primary/10 rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
        <div className="text-brand-primary group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-brand-primary transition-colors">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-light">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
