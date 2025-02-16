import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Konfigurasi Transporter Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT), // Pastikan dalam bentuk angka
  secure: process.env.SMTP_SECURE === "true", // Gunakan TLS jika perlu
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Handler untuk metode POST
export async function POST(req) {
  try {
    console.log("API dipanggil...");
    const body = await req.json();
    console.log("Data diterima:", body);

    const { nama, email, prodi, nim, status, angkatan, divisi, periode } = body;

    // Validasi input
    if (!nama || !email || !prodi || !status) {
      return NextResponse.json(
        { error: "Nama, Email, Prodi, dan Status wajib diisi." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Simpan data ke database dengan Prisma
    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        prodi,
        nim: nim || null,
        status,
        angkatan: status === "Mahasiswa" ? angkatan : null,
        divisi: status === "Panitia" ? divisi : null,
        periode: status === "Anggota DKM" ? periode : null,
      },
    });

    console.log("Data berhasil disimpan:", newUser);

    // Kirim email konfirmasi ke pengguna
    await transporter.sendMail({
      from: `"DKM Universitas Paramadina" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Konfirmasi Pendaftaran",
      html: `
        <h2>Halo, ${nama}!</h2>
        <p>Terima kasih telah mendaftar sebagai <strong>${status}</strong> di DKM Paramadina.</p>
        <p>Berikut detail pendaftaran Anda:</p>
        <ul>
          <li><strong>Nama:</strong> ${nama}</li>
          <li><strong>Prodi:</strong> ${prodi}</li>
          <li><strong>NIM:</strong> ${nim || "-"}</li>
          <li><strong>Status:</strong> ${status}</li>
          <li><strong>Angkatan:</strong> ${angkatan || "-"}</li>
          <li><strong>Divisi:</strong> ${divisi || "-"}</li>
          <li><strong>Periode:</strong> ${periode || "-"}</li>
        </ul>
        <p>Jika ada pertanyaan, silakan hubungi panitia.</p>
        <p>Salam,</p>
        <p><strong>DKM Universitas Paramadina</strong></p>
      `,
    });

    console.log("Email konfirmasi berhasil dikirim!");

    return NextResponse.json(
      { message: "Data berhasil disimpan & email terkirim!", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server.", details: error.message },
      { status: 500 }
    );
  }
}
