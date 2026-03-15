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

    if (status !== "Umum" && status !== "Alumni DKM" && !prodi) {
      return NextResponse.json(
        { error: "Prodi wajib diisi kecuali untuk status Umum atau Alumni DKM." },
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

    if ((status === "Pengurus DKM" || status === "Alumni DKM") && !periode) {
      return NextResponse.json(
        { error: "Periode harus diisi untuk status Pengurus DKM atau Alumni DKM." },
        { status: 400 }
      );
    }

    // Simpan data ke database dengan Prisma
    // Simpan data ke database dengan Prisma
    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        prodi: (status === "Umum" || status === "Alumni DKM") ? "-" : prodi, // Ganti null dengan "-"
        nim: nim || null,
        status,
        angkatan: status === "Mahasiswa" ? angkatan : null,
        divisi: status === "Panitia" ? divisi : null,
        periode: (status === "Pengurus DKM" || status === "Alumni DKM") ? periode : null,
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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background-color: #2563eb; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Konfirmasi Pendaftaran</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">Buka Bersama DKM Paramadina</p>
          </div>
          <div style="padding: 32px 24px; color: #374151; background-color: #ffffff;">
            <h2 style="margin-top: 0; color: #111827; font-size: 20px;">Halo, ${nama}!</h2>
            <p style="line-height: 1.6; margin-bottom: 24px;">Terima kasih telah mendaftar event Buka Bersama sebagai <strong style="color: #2563eb;">${status}</strong> di DKM Paramadina. Berikut adalah detail pendaftaran Anda:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 15px;">
              <tbody>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 35%;"><strong>Nama</strong></td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${nama}</td>
                </tr>
                ${(status !== "Umum" && status !== "Alumni DKM")
          ? `<tr>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Prodi</strong></td>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${prodi || "-"}</td>
                     </tr>`
          : ""
        }
                ${(status !== "Umum" && status !== "Alumni DKM")
          ? `<tr>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>NIM</strong></td>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${nim || "-"}</td>
                     </tr>`
          : ""
        }
                ${status === "Mahasiswa"
          ? `<tr>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Angkatan</strong></td>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${angkatan || "-"}</td>
                     </tr>`
          : ""
        }
                ${status === "Panitia"
          ? `<tr>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Divisi</strong></td>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${divisi || "-"}</td>
                     </tr>`
          : ""
        }
                ${(status === "Pengurus DKM" || status === "Alumni DKM")
          ? `<tr>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><strong>Periode</strong></td>
                      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827;">${periode || "-"}</td>
                     </tr>`
          : ""
        }
              </tbody>
            </table>
            
            <p style="line-height: 1.6;">Kami menantikan kehadiran Anda. Jika ada pertanyaan lebih lanjut, silakan hubungi tim panitia.</p>
          </div>
          <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Salam hangat,</p>
            <p style="margin: 6px 0 0; color: #374151; font-weight: 600; font-size: 15px;">DKM Universitas Paramadina</p>
            <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; font-style: italic;">Powered by Digital Teknologi DKM Paramadina</p>
          </div>
        </div>
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
