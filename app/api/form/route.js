import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Konfigurasi Transporter Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// Handler untuk metode POST
export async function POST(req) {
  try {
    const body = await req.json();
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

    // Kondisional untuk status
    if (status === "Mahasiswa" && !angkatan) {
      return NextResponse.json(
        { error: "Angkatan harus diisi untuk status Mahasiswa." },
        { status: 400 }
      );
    }

    if (status === "Panitia" && !divisi) {
      return NextResponse.json(
        { error: "Divisi harus diisi untuk status Panitia." },
        { status: 400 }
      );
    }

    if (status === "Anggota DKM" && !periode) {
      return NextResponse.json(
        { error: "Periode harus diisi untuk status Anggota DKM." },
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

    // Kirim email konfirmasi
    await transporter.sendMail({
      from: `"DKM Universitas Paramadina" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Konfirmasi Pendaftaran",
      html: `
        <h2>Halo, ${nama}!</h2>
        <p>Terima kasih telah mendaftar event Isra Miraj sebagai <strong>${status}</strong> di DKM Paramadina.</p>
        <p>Berikut detail pendaftaran Anda:</p>
        <ul>
          <li><strong>Nama:</strong> ${nama}</li>
          <li><strong>Prodi:</strong> ${prodi}</li>
          ${
            status !== "Dosen"
              ? `<li><strong>NIM:</strong> ${nim || "-"}</li>`
              : ""
          }
          ${
            status !== "Dosen" &&
            status !== "Panitia" &&
            status !== "Anggota DKM"
              ? `<li><strong>Angkatan:</strong> ${angkatan || "-"}</li>`
              : ""
          }
          ${
            status !== "Mahasiswa" &&
            status !== "Dosen" &&
            status !== "Anggota DKM"
              ? `<li><strong>Divisi:</strong> ${divisi || "-"}</li>`
              : ""
          }
          ${
            status !== "Dosen" && status !== "Mahasiswa" && status !== "Panitia"
              ? `<li><strong>Periode:</strong> ${periode || "-"}</li>`
              : ""
          }
        </ul>
        <p>Jika ada pertanyaan, silakan hubungi panitia.</p>
        <p>Salam,</p>
        <p><strong>DKM Universitas Paramadina</strong></p>
      `,
    });

    return NextResponse.json(
      { message: "Data berhasil disimpan & email terkirim!", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error(error.message || error); // Tampilkan pesan kesalahan yang lebih aman
    return NextResponse.json(
      {
        error: "Terjadi kesalahan server.",
        details: error.message || "Tidak ada detail kesalahan", // Pastikan error.message ada
      },
      { status: 500 }
    );
  }
}
