"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { PrinterIcon } from "@heroicons/react/24/solid";

export default function DaftarKehadiran() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    angkatan: "",
    divisi: "",
    prodi: "",
    periode: "",
  });

  useEffect(() => {
    Swal.fire({
      title: "Masukkan Password",
      input: "password",
      inputPlaceholder: "Masukkan password...",
      showCancelButton: true,
      confirmButtonText: "Masuk",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4ea8de", // Warna biru muda
      cancelButtonColor: "#d33", // Warna merah untuk "Batal"
      inputAttributes: { autocapitalize: "off" },
      reverseButtons: true, // Menukar posisi tombol
      preConfirm: (password) => {
        if (password === "naeemadkmparamadina") {
          setIsAuthorized(true);
          fetchData();
        } else {
          Swal.fire({
            icon: "error",
            title: "Password Salah!",
            text: "Silakan coba lagi.",
          }).then(() => {
            window.location.href = "/regristrasi";
          });
        }
      },
    });
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/form");
      if (!response.ok) throw new Error("Gagal mengambil data");

      const data = await response.json();
      const uniqueUsers = Array.from(
        new Map(data.map((user) => [user.id, user])).values()
      );      

      setUsers(uniqueUsers);
      setFilteredUsers(uniqueUsers);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal mengambil data dari server.",
      });
    }
  };

  useEffect(() => {
    filterData();
  }, [search, filters]);

  const filterData = () => {
    let data = users.filter((user) =>
      user.nama.toLowerCase().includes(search.toLowerCase())
    );

    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key] !== "") {
        data = data.filter((user) => user[key] === filters[key]);
      }
    });

    setFilteredUsers(data);
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Kehadiran");

    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

    const fileName = `Daftar_Kehadiran-${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    Swal.fire({
      icon: "success",
      title: "Berhasil Mengunduh!",
      text: `File ${fileName} telah diunduh.`,
    });
  };

  const updateAttendance = async (id, nim, kehadiran) => {
    try {
      const response = await fetch("/api/updateAttendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nim, kehadiran }), // Kirim id jika nim kosong
      });

      if (!response.ok) throw new Error("Gagal memperbarui kehadiran");

      const updatedUser = await response.json();

      setUsers((prev) =>
        prev.map((user) =>
          (nim && user.nim === nim) || (!nim && user.id === id)
            ? { ...user, kehadiran }
            : user
        )
      );

      setFilteredUsers((prev) =>
        prev.map((user) =>
          (nim && user.nim === nim) || (!nim && user.id === id)
            ? { ...user, kehadiran }
            : user
        )
      );

      // Notifikasi sukses
      Swal.fire({
        icon: "success",
        title: "Kehadiran diperbarui!",
        text: `Kehadiran ${updatedUser.nama} berhasil diubah.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal memperbarui kehadiran.",
      });
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Daftar Kehadiran</h2>

      {/* Pencarian dan Filter */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Cari nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border border-blue-300 text-black rounded-md"
        />

        {["angkatan", "divisi", "prodi", "periode", "status"].map((filterKey) => (
          <select
            key={filterKey}
            className="p-2 border border-blue-300 text-black rounded-md"
            value={filters[filterKey]}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, [filterKey]: e.target.value }))
            }
          >
            <option value="">
              Filter {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
            </option>
            {[...new Set(users.map((u) => u[filterKey]).filter(Boolean))].map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              )
            )}
          </select>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleDownload}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center gap-2"
        >
          <PrinterIcon className="w-5 h-5" />
          Unduh Excel
        </button>
      </div>

      {/* Tabel Data */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-blue-300 mt-4 text-sm sm:text-base">
          <thead>
            <tr className="bg-blue-200 text-black text-danger">
              <th className="border border-blue-300 text-black px-4 py-2">
                No
              </th>
              {[
                "Nama",
                "Prodi",
                "NIM",
                "Status",
                "Angkatan",
                "Divisi",
                "Periode",
                "Kehadiran",
              ].map((header) => (
                <th
                  key={header}
                  className="border border-blue-300 text-black px-4 py-2"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-blue-100">
                  <td className="border border-blue-300 text-black px-4 py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-blue-300 text-black px-4 py-2">
                    {user.nama || "-"}
                  </td>
                  <td className="border border-blue-300 text-black px-4 py-2">
                    {user.prodi || "-"}
                  </td>
                  <td className="border border-blue-300 text-black px-4 py-2">
                    {user.nim || "-"}
                  </td>
                  <td className="border border-blue-300 text-black px-4 py-2">
                    {user.status || "-"}
                  </td>
                  <td className="border border-blue-300 text-black px-4 py-2">
                    {user.angkatan || "-"}
                  </td>
                  <td className="border border-blue-300 text-black px-4 py-2">
                    {user.divisi || "-"}
                  </td>
                  <td className="border border-blue-300 text-black px-4 py-2">
                    {user.periode || "-"}
                  </td>
                  <td className="border border-blue-300 text-black px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={user.kehadiran}
                      onChange={(e) =>
                        updateAttendance(user.id, user.nim, e.target.checked)
                      }
                      className="w-5 h-5"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="text-center text-black border border-blue-300 px-4 py-2"
                >
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
