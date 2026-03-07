"use client";

import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  CheckBadgeIcon,
  XCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function DaftarKehadiran() {
  const [users, setUsers] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    angkatan: "",
    divisi: "",
    prodi: "",
    periode: "",
    status: "",
  });

  useEffect(() => {
    Swal.fire({
      title: "Area Terbatas",
      text: "Silakan masukkan password akses dashboard.",
      input: "password",
      inputPlaceholder: "Password...",
      showCancelButton: true,
      confirmButtonText: "Buka Dashboard",
      cancelButtonText: "Kembali",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#64748b",
      inputAttributes: { autocapitalize: "off" },
      backdrop: `rgba(2, 6, 23, 0.9)`,
      customClass: {
        popup: 'rounded-3xl border border-slate-700 bg-slate-900 text-white',
        title: 'text-2xl font-bold text-white',
        input: 'bg-slate-800 border-slate-700 text-white rounded-xl focus:ring-primary'
      },
      preConfirm: (password) => {
        if (password === "naeemadkmparamadina") {
          setIsAuthorized(true);
          fetchData();
        } else {
          Swal.fire({
            icon: "error",
            title: "Akses Ditolak",
            text: "Password yang Anda masukkan salah.",
            confirmButtonColor: "#3b82f6",
          }).then(() => {
            window.location.href = "/regristrasi";
          });
        }
      },
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/form");
      if (!response.ok) throw new Error("Gagal mengambil data");

      const data = await response.json();
      const uniqueUsers = Array.from(
        new Map(data.map((user) => [user.id, user])).values()
      );

      setUsers(uniqueUsers);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Koneksi Bermasalah",
        text: "Gagal mengambil data dari server. Pastikan API berjalan.",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch = user.nama.toLowerCase().includes(search.toLowerCase()) ||
        (user.nim && user.nim.toLowerCase().includes(search.toLowerCase()));

      const matchFilters = Object.keys(filters).every((key) => {
        if (!filters[key]) return true;
        return user[key] === filters[key];
      });

      return matchSearch && matchFilters;
    });
  }, [users, search, filters]);

  const stats = useMemo(() => {
    const total = filteredUsers.length;
    const present = filteredUsers.filter(u => u.kehadiran).length;
    const absent = total - present;
    return { total, present, absent };
  }, [filteredUsers]);

  const handleDownload = () => {
    if (filteredUsers.length === 0) {
      toast.error("Tidak ada data untuk diunduh!");
      return;
    }

    // Format data for Excel
    const dataToExport = filteredUsers.map((u, i) => ({
      No: i + 1,
      Nama: u.nama,
      Email: u.email,
      NIM: u.nim || "-",
      Status: u.status,
      Prodi: u.prodi || "-",
      Angkatan: u.angkatan || "-",
      Divisi: u.divisi || "-",
      Periode: u.periode || "-",
      Kehadiran: u.kehadiran ? "Hadir" : "Belum Hadir"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Add summary row
    XLSX.utils.sheet_add_aoa(worksheet, [
      [],
      ["Ringkasan Kehadiran"],
      ["Total Peserta", stats.total],
      ["Hadir", stats.present],
      ["Belum Hadir", stats.absent]
    ], { origin: -1 });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Kehadiran");

    const now = new Date();
    const fileName = `Attendance_Report_${now.toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);

    Swal.fire({
      icon: "success",
      title: "Laporan Siap!",
      text: "Laporan kehadiran berhasil diunduh.",
      confirmButtonColor: "#3b82f6",
    });
  };

  const updateAttendance = async (id, nim, kehadiran) => {
    try {
      const response = await fetch("/api/updateAttendance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, nim, kehadiran }),
      });

      if (!response.ok) throw new Error("Gagal memperbarui kehadiran");

      setUsers((prev) =>
        prev.map((user) =>
          (nim && user.nim === nim) || (!nim && user.id === id)
            ? { ...user, kehadiran }
            : user
        )
      );

      toast.success("Status kehadiran diperbarui!", {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#1e293b',
          color: '#fff',
        },
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Update",
        text: "Terjadi kesalahan saat memperbarui status.",
      });
    }
  };

  if (!isAuthorized) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-10 font-['Outfit']">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard Kehadiran</h2>
            <p className="text-slate-500 dark:text-slate-400">Kelola dan pantau peserta event secara real-time.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-4"
          >
            <button
              onClick={fetchData}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
              title="Refresh Data"
            >
              <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleDownload}
              className="btn-vibrant text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition shadow-lg transition-transform active:scale-95"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Ekspor Laporan</span>
            </button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          <StatCard
            title="Total Peserta"
            value={stats.total}
            icon={<UserGroupIcon className="w-6 h-6" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Hadir"
            value={stats.present}
            icon={<CheckBadgeIcon className="w-6 h-6" />}
            color="bg-emerald-500"
          />
          <StatCard
            title="Belum Hadir"
            value={stats.absent}
            icon={<XCircleIcon className="w-6 h-6" />}
            color="bg-rose-500"
          />
        </motion.div>

        {/* Filters and Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl overflow-hidden shadow-xl"
        >
          {/* Filter Bar */}
          <div className="p-6 md:p-8 bg-white/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Cari Nama atau NIM..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>

              {["status", "prodi", "angkatan", "divisi"].map((filterKey) => (
                <div key={filterKey} className="relative group">
                  <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 appearance-none focus:border-primary outline-none transition-all text-slate-900 dark:text-white capitalize"
                    value={filters[filterKey]}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, [filterKey]: e.target.value }))
                    }
                  >
                    <option value="">Semua {filterKey}</option>
                    {[...new Set(users.map((u) => u[filterKey]).filter(Boolean))].sort().map(
                      (value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      )
                    )}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-5">No</th>
                  <th className="px-6 py-5">Identitas Peserta</th>
                  <th className="px-6 py-5 text-center">Status</th>
                  <th className="px-6 py-5">Program Studi</th>
                  <th className="px-6 py-5 text-center">Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <AnimatePresence>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-400 font-medium">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white">{user.nama}</span>
                            <span className="text-xs text-slate-500 font-mono tracking-tight">{user.nim || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${user.status === 'Mahasiswa' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            user.status === 'Panitia' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                            }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col text-sm">
                            <span className="text-slate-700 dark:text-slate-300">{user.prodi || '-'}</span>
                            {user.angkatan && <span className="text-xs text-slate-400">Angkatan {user.angkatan}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => updateAttendance(user.id, user.nim, !user.kehadiran)}
                              className={`w-12 h-6 rounded-full relative transition-colors duration-300 flex items-center p-1 ${user.kehadiran ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                            >
                              <motion.div
                                animate={{ x: user.kehadiran ? 24 : 0 }}
                                className="w-4 h-4 rounded-full bg-white shadow-sm"
                              />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <MagnifyingGlassIcon className="w-12 h-12 text-slate-200 mb-4" />
                          <p className="text-slate-500 font-medium">Tidak ada data yang cocok dengan kriteria Anda.</p>
                          <button
                            onClick={() => { setSearch(""); setFilters({ angkatan: "", divisi: "", prodi: "", periode: "", status: "" }) }}
                            className="mt-4 text-primary font-bold hover:underline"
                          >
                            Reset Filter
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <motion.div
      variants={{ hidden: { scale: 0.9, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
      className="glass p-6 rounded-3xl flex items-center space-x-5 shadow-lg relative overflow-hidden group"
    >
      <div className={`p-4 rounded-2xl ${color} text-white transition-transform group-hover:scale-110 duration-500 shadow-lg shadow-black/10`}>
        {icon}
      </div>
      <div>
        <h4 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h4>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none mt-1">{value}</p>
      </div>
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.03] rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
    </motion.div>
  );
}
