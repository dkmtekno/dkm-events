"use client";

import { useState } from "react";

export default function FormPage() {
  const [formData, setFormData] = useState({
    nama: "",
    prodi: "",
    nim: "",
    status: "",
    angkatan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status" && value !== "Panitia" ? { angkatan: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/form", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Data berhasil disimpan!");
      setFormData({ nama: "", prodi: "", nim: "", status: "", angkatan: "" });
    } else {
      alert("Terjadi kesalahan!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-8 py-12">
      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-12 items-center">
        {/* Bagian Kiri (Teks + Gambar) */}
        <div className="md:w-1/2 text-center md:text-left space-y-6">
          <h2 className="text-3xl font-bold text-blue-600">
            Jadilah Bagian dari Keberkahan!
          </h2>
          <p className="text-lg text-gray-600">
            Kelola kehadiran dan aktivitas DKM dengan lebih mudah dan efisien.
            Bersama, kita tingkatkan kegiatan keislaman yang lebih baik.
          </p>
          <img
            src="/logo_dkm_paramadina.png"
            alt="DKM"
            className="w-full max-w-sm md:max-w-md mx-auto md:mx-0"
          />
        </div>

        {/* Bagian Kanan (Form) */}
        <div className="md:w-1/2">
          <h2 className="text-2xl font-bold mb-6 text-center md:text-left">
            Formulir Pendaftaran
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              name="nama"
              placeholder="Nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full p-3 text-lg rounded-md bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="text"
              name="prodi"
              placeholder="Prodi"
              value={formData.prodi}
              onChange={handleChange}
              className="w-full p-3 text-lg rounded-md bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="text"
              name="nim"
              placeholder="NIM"
              value={formData.nim}
              onChange={handleChange}
              className="w-full p-3 text-lg rounded-md bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 text-lg rounded-md bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Pilih Status</option>
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Dosen">Dosen</option>
              <option value="Panitia">Panitia</option>
            </select>

            {formData.status === "Panitia" && (
              <input
                type="text"
                name="angkatan"
                placeholder="Angkatan"
                value={formData.angkatan}
                onChange={handleChange}
                className="w-full p-3 text-lg rounded-md bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 text-lg rounded-md shadow-md hover:bg-blue-700 transition"
            >
              Simpan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
