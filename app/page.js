'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

export default function LoginPage() {
  const [isTransitioning, setIsTransitioning] = useState(false);

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
          <Image src="/logo_dkm_paramadina.png" alt="Logo" width={160} height={50} />
        </motion.div>

        {/* Selamat Datang */}
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl font-bold mt-6 text-center"
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
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
          }}
          className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 mt-8"
        >
          <LoginCard title="Mahasiswa" icon="🎓" setIsTransitioning={setIsTransitioning} />
          <LoginCard title="Dosen" icon="🧑‍🏫" setIsTransitioning={setIsTransitioning} />
          <LoginCard title="Pengurus DKM" icon="🕌" setIsTransitioning={setIsTransitioning} />
          <LoginCard title="Umum" icon="🌎" setIsTransitioning={setIsTransitioning} />
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="text-gray-500 text-sm mt-8 text-center"
        >
          © DKM Paramadina 2025. Hak Cipta Dilindungi.
          <br />
          <a href="#" className="text-blue-600 underline text-center">
            Powered by DKM Paramadina.
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
        <p className="text-gray-500 text-xs sm:text-sm">Saya Seorang</p>
        <p className="text-blue-600 font-bold text-md sm:text-lg break-words whitespace-normal">
          {title}
        </p>
      </div>
    </motion.div>
  );
}
