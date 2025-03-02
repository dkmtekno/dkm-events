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
      inputAttributes: { autocapitalize: "off" },
      preConfirm: (password) => {
        if (password === "naeemadkmparamadina") {
          setIsAuthorized(true);
          fetchData();
        } else {
          Swal.fire({
            icon: "error",
            title: "Password Salah!",
            text: "Silakan coba lagi.",
            customClass: {
              confirmButton: "bg-blue-600 text-white",
              cancelButton: "bg-gray-400 text-white",
            },
          }).then(() => {
            window.location.href = "/";
          });
        }
      },
      customClass: {
        confirmButton: "bg-[#0066ff] text-white",
        cancelButton: "bg-gray-400 text-white",
      },
    });
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/form");
      if (!response.ok) throw new Error("Gagal mengambil data");

      const data = await response.json();

      // Hilangkan duplikasi berdasarkan 'nim' (bisa disesuaikan dengan field unik lainnya)
      const uniqueUsers = Array.from(
        new Map(data.map((user) => [user.nim, user])).values()
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
      if (filters[key]) {
        data = data.filter((user) => user[key] === filters[key]);
      }
    });

    setFilteredUsers(data);
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Kehadiran");

    // Ambil tanggal dan waktu saat ini
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

    // Buat nama file dengan format "Daftar_Kehadiran-YYYYMMDD_HHMM.xlsx"
    const fileName = `Daftar_Kehadiran-${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    Swal.fire({
      icon: "success",
      title: "Berhasil Mengunduh!",
      text: `File ${fileName} telah diunduh.`,
    });
  };

  if (!isAuthorized) return null;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Daftar Kehadiran</h2>

      {/* Pencarian dan Filter */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Cari nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-md"
        />

        {["angkatan", "divisi", "prodi", "periode"].map((filterKey) => (
          <select
            key={filterKey}
            className="p-2 border rounded-md"
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
      {/* Tabel Data */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 mt-4 text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2">
                No
              </th>{" "}
              {/* Tambahkan kolom No */}
              {[
                "Nama",
                "Prodi",
                "NIM",
                "Status",
                "Angkatan",
                "Divisi",
                "Periode",
              ].map((header) => (
                <th
                  key={header}
                  className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2 text-center">
                    {index + 1}
                  </td>{" "}
                  {/* Tambahkan nomor urut */}
                  <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2">
                    {user.nama}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2">
                    {user.prodi}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2">
                    {user.nim}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2">
                    {user.status}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2">
                    {user.angkatan || "-"}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2">
                    {user.divisi || "-"}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 sm:px-4 sm:py-2">
                    {user.periode || "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center border border-gray-300 px-4 py-2"
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
