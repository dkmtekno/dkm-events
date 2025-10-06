"use client";

import Image from "next/image";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  AcademicCapIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/solid";

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
          });
        } else if (sisaKuota <= 10) {
          Swal.fire({
            title: "Kuota Hampir Habis!",
            text: `Sisa kuota tinggal ${sisaKuota} orang. Daftar segera!`,
            icon: "warning",
            confirmButtonText: "Mengerti",
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
      <div className="flex flex-col items-center justify-center min-h-screen px-6 sm:px-10 text-center bg-gray-100">
        <Image
          src="/kucing_sedih.gif"
          alt="Pendaftaran Ditutup"
          width={180}
          height={180}
          priority
          className="w-40 sm:w-48"
        />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mt-4">
          😢 Pendaftaran Ditutup...
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Maaf sekali, kuota sudah penuh. Kami tidak bisa menerima pendaftaran
          lagi.
        </p>
        <p className="text-gray-500 italic mt-1 text-xs sm:text-sm">
          Semoga kita bisa bertemu di kesempatan berikutnya... 💔
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-500 to-blue-400 px-6 sm:px-14"
    >
      <div className="bg-white p-8 sm:p-14 rounded-2xl shadow-lg w-full max-w-2xl text-left">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Image
            src="/logo_dkm_paramadina.png"
            alt="Logo"
            width={160}
            height={50}
          />
        </motion.div>

        {/* Selamat Datang */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl text-sky-950 font-bold mt-6 text-center"
        >
          Selamat Datang
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-gray-600 text-center"
        >
          Pilih role untuk masuk
        </motion.p>

        {/* Pilihan Login */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
          }}
          className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 mt-8"
        >
          <LoginCard
            title="Mahasiswa"
            icon={<AcademicCapIcon className="w-8 h-8 text-blue-600" />}
            setIsTransitioning={setIsTransitioning}
          />
          <LoginCard
            title="Dosen/Umum"
            icon={<GlobeAltIcon className="w-8 h-8 text-blue-600" />}
            setIsTransitioning={setIsTransitioning}
          />
          <LoginCard
            title="Pengurus DKM"
            icon={<BuildingLibraryIcon className="w-8 h-8 text-blue-600" />}
            setIsTransitioning={setIsTransitioning}
          />
          <LoginCard
            title="Panitia"
            icon={
              <ClipboardDocumentListIcon className="w-8 h-8 text-blue-600" />
            }
            setIsTransitioning={setIsTransitioning}
          />
        </motion.div>

        <p className="text-gray-600 mt-4 text-sm text-center sm:text-base">
          Sisa kuota pendaftaran: <span className="font-bold">{sisaKuota}</span>{" "}
          orang
        </p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="text-gray-500 text-sm mt-8 text-center"
        >
          © DKM Paramadina 2025. Hak Cipta Dilindungi.
          <br />
          <a href="#" className="text-blue-600 underline text-center">
            Powered by Teknologi DKM Paramadina.
          </a>
        </motion.p>
      </div>

      {/* Overlay "Mengarahkan..." */}
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-white z-50 w-screen h-screen"
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-blue-600"
          >
            Mengarahkan...
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Komponen Kartu Login
function LoginCard({ title, icon, setIsTransitioning }) {
  const router = useRouter();

  const handleClick = () => {
    setIsTransitioning(true);
    sessionStorage.setItem("role", title);

    setTimeout(() => {
      router.push("/regristrasi");
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="flex items-center gap-4 p-5 sm:p-6 border rounded-lg shadow-sm bg-blue-50 border-blue-300 hover:bg-blue-100 transition duration-300 cursor-pointer w-full flex-wrap"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-blue-200 rounded-full">
        <span className="text-blue-600 text-2xl sm:text-3xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-xs sm:text-sm">Sebagai</p>
        <p className="text-blue-600 font-bold text-md sm:text-lg break-words whitespace-normal">
          {title}
        </p>
      </div>
    </motion.div>
  );
}
