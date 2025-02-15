"use client";

import { useEffect, useState } from "react";

export default function DaftarKehadiran() {
  const [users, setUsers] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const password = prompt("Masukkan password untuk melihat data:");
    if (password === "naeemadkmparamadina") {
      setIsAuthorized(true);
      fetchData();
    } else {
      alert("Password salah!");
      window.location.href = "/";
    }
  }, []);

  const fetchData = async () => {
    const response = await fetch("/api/form");
    const data = await response.json();
    setUsers(data);
  };

  if (!isAuthorized) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Daftar Kehadiran</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Nama</th>
            <th className="border border-gray-300 px-4 py-2">Prodi</th>
            <th className="border border-gray-300 px-4 py-2">NIM</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Angkatan</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-4 py-2">{user.nama}</td>
                <td className="border border-gray-300 px-4 py-2">{user.prodi}</td>
                <td className="border border-gray-300 px-4 py-2">{user.nim}</td>
                <td className="border border-gray-300 px-4 py-2">{user.status}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {user.status === "Panitia" ? user.angkatan || "-" : "-"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center border border-gray-300 px-4 py-2">
                Tidak ada data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
