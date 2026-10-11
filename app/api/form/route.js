import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import QRCode from "qrcode";

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

    // Generate QR Code data
    const qrPayload = JSON.stringify({
      id: newUser.id,
      nim: newUser.nim || "",
      nama: newUser.nama,
      email: newUser.email,
      status: newUser.status,
      prodi: newUser.prodi || "",
      app: "DKM_PARAMADINA_EVENT",
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 360,
      margin: 2,
      color: {
        dark: "#090d16",
        light: "#ffffff",
      },
    });

    const qrBuffer = await QRCode.toBuffer(qrPayload, {
      width: 360,
      margin: 2,
      color: {
        dark: "#090d16",
        light: "#ffffff",
      },
    });

    // Kirim email konfirmasi dengan lampiran & tampilan QR Code
    let emailSent = false;
    try {
      const emailContent = {
        from: `"DKM Universitas Paramadina" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Konfirmasi Pendaftaran & QR Code Kehadiran - ${nama}`,
        attachments: [
          {
            filename: `qrcode-${newUser.id}.png`,
            content: qrBuffer,
            cid: "qrcode_kehadiran",
          },
        ],
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%); color: #ffffff; padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">Konfirmasi Pendaftaran & Tiket</h1>
              <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Damara DKM Paramadina</p>
            </div>
            
            <div style="padding: 30px 24px; color: #334155; background-color: #ffffff;">
              <h2 style="margin-top: 0; color: #0f172a; font-size: 19px;">Halo, ${nama}! 👋</h2>
              <p style="line-height: 1.6; margin-bottom: 24px; font-size: 15px;">
                Pendaftaran Anda sebagai <strong style="color: #2563eb;">${status}</strong> di event DKM Paramadina telah berhasil terverifikasi.
              </p>

              <!-- QR Code Card -->
              <div style="text-align: center; margin: 24px 0; padding: 24px 16px; background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%); border: 2px dashed #16a34a; border-radius: 16px;">
                <div style="display: inline-block; padding: 4px 12px; background-color: #16a34a; color: #ffffff; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                  Tiket Presensi Resmi
                </div>
                <h3 style="margin: 0 0 8px; color: #14532d; font-size: 17px; font-weight: 700;">QR Code Kehadiran Anda</h3>
                <p style="margin: 0 0 16px; color: #15803d; font-size: 13px;">Tunjukkan QR Code ini kepada panitia saat tiba di lokasi untuk verifikasi kehadiran otomatis.</p>
                <div style="display: inline-block; padding: 12px; background: #ffffff; border-radius: 14px; box-shadow: 0 4px 14px rgba(0,0,0,0.07); border: 1px solid #e2e8f0;">
                  <img src="cid:qrcode_kehadiran" alt="QR Code Kehadiran" width="220" height="220" style="display: block; margin: 0 auto; border-radius: 8px;" />
                </div>
                <p style="margin: 12px 0 0; font-size: 12px; color: #64748b; font-family: monospace;">ID Tiket: ${newUser.id}</p>
              </div>
              
              <h3 style="margin: 0 0 14px; font-size: 15px; color: #0f172a;">Detail Pendaftaran:</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 14px;">
                <tbody>
                  <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #64748b; width: 35%;"><strong>Nama</strong></td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-weight: 600;">${nama}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Status</strong></td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${status}</td>
                  </tr>
                  ${(status !== "Umum" && status !== "Alumni DKM")
                    ? `<tr>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Prodi</strong></td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${prodi || "-"}</td>
                       </tr>`
                    : ""
                  }
                  ${(status !== "Umum" && status !== "Alumni DKM")
                    ? `<tr>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>NIM</strong></td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${nim || "-"}</td>
                       </tr>`
                    : ""
                  }
                  ${status === "Mahasiswa"
                    ? `<tr>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Angkatan</strong></td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${angkatan || "-"}</td>
                       </tr>`
                    : ""
                  }
                  ${status === "Panitia"
                    ? `<tr>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Divisi</strong></td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${divisi || "-"}</td>
                       </tr>`
                    : ""
                  }
                  ${(status === "Pengurus DKM" || status === "Alumni DKM")
                    ? `<tr>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Periode</strong></td>
                        <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${periode || "-"}</td>
                       </tr>`
                    : ""
                  }
                </tbody>
              </table>
              
              <p style="line-height: 1.6; color: #475569; font-size: 14px; margin-bottom: 0;">
                Kami menantikan kehadiran Anda. Simpan email ini atau unduh gambar QR Code di atas untuk ditunjukkan pada panitia di lokasi acara.
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">Salam hangat,</p>
              <p style="margin: 4px 0 0; color: #1e293b; font-weight: 600; font-size: 14px;">DKM Universitas Paramadina</p>
              <p style="margin: 12px 0 0; color: #94a3b8; font-size: 11px; font-style: italic;">Powered by Digital Teknologi DKM Paramadina</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(emailContent);
      emailSent = true;
    } catch (mailError) {
      console.warn("Peringatan: Gagal mengirim email konfirmasi:", mailError.message || mailError);
    }

    return NextResponse.json(
      {
        message: emailSent
          ? "Data berhasil disimpan & QR code terkirim ke email!"
          : "Data pendaftaran berhasil disimpan!",
        user: newUser,
        qrCode: qrDataUrl,
        emailSent,
      },
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
