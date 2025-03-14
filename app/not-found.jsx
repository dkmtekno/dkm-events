"use client";  
import { useRouter } from "next/navigation";

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white relative overflow-hidden px-4 text-center">
      {/* Elemen dekoratif */}
      <div className="absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-blue-400 rounded-full bottom-[-10%] left-[-10%]"></div>
      <div className="absolute w-[10vw] h-[10vw] max-w-[120px] max-h-[120px] bg-yellow-300 rounded-full bottom-[25%] left-[20%]"></div>
      <div className="absolute w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-yellow-300 rounded-full top-[-10%] right-[-10%]"></div>
      <div className="absolute w-[10vw] h-[10vw] max-w-[120px] max-h-[120px] bg-blue-400 rounded-full top-[20%] right-[20%]"></div>
      
      {/* Teks utama */}
      <h1 className="text-[20vw] max-text-[180px] font-bold text-yellow-200 absolute opacity-40">Oops</h1>
      <h2 className="text-[10vw] max-text-[100px] font-bold text-blue-400 relative z-10">404</h2>
      <p className="mt-4 text-lg text-black relative font-bold z-10 px-4">
        Afwan akhi wa ukhti, sepertinya halaman ini sedang dalam pemeliharaan, ditunggu yak!
      </p>
      <button 
        onClick={() => router.push('/')} 
        className="mt-5 bg-blue-500 text-white py-2 px-5 md:py-3 md:px-6 rounded-lg shadow-lg text-sm md:text-base font-semibold hover:scale-105 transition transform"
      >
        Kembali
      </button>
    </div>
  );
}
