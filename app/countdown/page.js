  'use client';

  import { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { motion } from "framer-motion";

  export default function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 10, seconds: 13 });
    const [role, setRole] = useState("Pengguna");
    const router = useRouter();

    useEffect(() => {
      // Ambil role dari sessionStorage
      const storedRole = sessionStorage.getItem("role");
      if (storedRole) setRole(storedRole);

      const interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          let { hours, minutes, seconds } = prevTime;
          
          if (seconds > 0) {
            seconds -= 1;
          } else {
            if (minutes > 0) {
              minutes -= 1;
              seconds = 59;
            } else if (hours > 0) {
              hours -= 1;
              minutes = 59;
              seconds = 59;
            }
          }

          return { hours, minutes, seconds };
        });
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center h-screen bg-blue-400 text-dark p-4 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold">Anda sebagai {role}!</h1>
        <p className="text-xl md:text-2xl mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
        
        <div className="flex space-x-2 md:space-x-4 mt-4 text-4xl md:text-6xl font-bold">
          <div className="bg-blue-200 px-4 py-2 md:px-6 md:py-2 rounded-lg">{String(timeLeft.hours).padStart(2, '0')}</div>
          <span>:</span>
          <div className="bg-blue-200 px-4 py-2 md:px-6 md:py-2 rounded-lg">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <span>:</span>
          <div className="bg-blue-200 px-4 py-2 md:px-6 md:py-2 rounded-lg">{String(timeLeft.seconds).padStart(2, '0')}</div>
        </div>

        <button 
          onClick={() => router.push('/regristrasi')} 
          className="mt-6 bg-white text-blue-700 font-bold py-2 px-6 rounded-lg shadow-md transition transform hover:scale-95 active:scale-90 hover:bg-blue-700 hover:text-white"
        >
          Selanjutnya
        </button>
      </motion.div>
    );
  }
