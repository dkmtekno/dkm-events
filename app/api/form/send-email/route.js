import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

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
        periode: status === "Pengurus DKM" ? periode : null,
      },
    });

    console.log("Data berhasil disimpan:", newUser);

    // Kirim email konfirmasi ke pengguna
    await transporter.sendMail({
      from: `"DKM Universitas Paramadina" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Konfirmasi Pendaftaran",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background-color: #2563eb; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Konfirmasi Pendaftaran</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">Buka Bersama DKM Paramadina</p>
          </div>
          <div style="padding: 32px 24px; color: #374151; background-color: #ffffff;">
            <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Halo, ${nama}!</h2>
            <p style="line-height: 1.6; margin-bottom: 24px;">Terima kasih telah mendaftar sebagai <strong style="color: #2563eb;">${status}</strong> di DKM Paramadina. Berikut adalah detail pendaftaran Anda:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 15px;">
              <tbody>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 35%;"><strong>Nama</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${nama}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Prodi</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${prodi}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>NIM</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${nim || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Status</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${status}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Angkatan</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${angkatan || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Divisi</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${divisi || "-"}</td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Periode</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${periode || "-"}</td>
                </tr>
              </tbody>
            </table>
            
            <p style="line-height: 1.6;">Kami menantikan kehadiran Anda. Jika ada pertanyaan lebih lanjut, silakan hubungi tim panitia.</p>
          </div>
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Salam hangat,</p>
            <p style="margin: 6px 0 0; color: #374151; font-weight: 600; font-size: 15px;">DKM Universitas Paramadina</p>
          </div>
        </div>
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
