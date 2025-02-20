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
      { error: "Gagal mengambil data", details: error.message },
      { status: 500 }
    );
  }
}

// Handler untuk metode POST
export async function POST(req) {
  try {
    const bodyText = await req.text();
    if (!bodyText) {
      return NextResponse.json(
        { error: "Request body kosong." },
        { status: 400 }
      );
    }

    const body = JSON.parse(bodyText);
    const { nama, email, prodi, nim, status, angkatan, divisi, periode } = body;

    // Validasi input
    if (!nama || !email || !status) {
      return NextResponse.json(
        { error: "Nama, Email, dan Status wajib diisi." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (status !== "Umum" && !prodi) {
      return NextResponse.json(
        { error: "Prodi wajib diisi kecuali untuk status Umum." },
        { status: 400 }
      );
    }

    // Validasi tambahan
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

    if (status === "Pengurus DKM" && !periode) {
      return NextResponse.json(
        { error: "Periode harus diisi untuk status Pengurus DKM." },
        { status: 400 }
      );
    }

    // Simpan data ke database dengan Prisma
    // Simpan data ke database dengan Prisma
    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        prodi: status === "Umum" ? "-" : prodi, // Ganti null dengan "-"
        nim: nim || null,
        status,
        angkatan: status === "Mahasiswa" ? angkatan : null,
        divisi: status === "Panitia" ? divisi : null,
        periode: status === "Pengurus DKM" ? periode : null,
      },
    });

    if (!newUser) {
      return NextResponse.json(
        { error: "Gagal menyimpan data." },
        { status: 500 }
      );
    }

    // Kirim email konfirmasi
    const emailContent = {
      from: `"DKM Universitas Paramadina" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Konfirmasi Pendaftaran",
      html: `
        <h2>Halo, ${nama}!</h2>
        <p>Terima kasih telah mendaftar event Isra Miraj sebagai <strong>${status}</strong> di DKM Paramadina.</p>
        <p>Berikut detail pendaftaran Anda:</p>
        <ul>
          <li><strong>Nama:</strong> ${nama}</li>
          ${
            status !== "Umum"
              ? `<li><strong>Prodi:</strong> ${prodi || "-"}</li>`
              : ""
          }
          ${
            status !== "Umum"
              ? `<li><strong>NIM:</strong> ${nim || "-"}</li>`
              : ""
          }
          ${
            status === "Mahasiswa"
              ? `<li><strong>Angkatan:</strong> ${angkatan || "-"}</li>`
              : ""
          }
          ${
            status === "Panitia"
              ? `<li><strong>Divisi:</strong> ${divisi || "-"}</li>`
              : ""
          }
          ${
            status === "Pengurus DKM"
              ? `<li><strong>Periode:</strong> ${periode || "-"}</li>`
              : ""
          }
        </ul>
        <p>Jika ada pertanyaan, silakan hubungi panitia.</p>
        <p>Salam,</p>
        <p><strong>DKM Universitas Paramadina</strong></p>
      `,
    };

    await transporter.sendMail(emailContent);

    return NextResponse.json(
      { message: "Data berhasil disimpan & email terkirim!", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error terjadi:", error.message || error);
    return NextResponse.json(
      {
        error: "Terjadi kesalahan server.",
        details: error.message || "Tidak ada detail kesalahan",
      },
      { status: 500 }
    );
  }
}
