import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const { id, nim, kehadiran } = await req.json();

    if (!nim && !id) {
      return NextResponse.json(
        { error: "ID atau NIM diperlukan" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: nim ? { nim } : { id }, // Gunakan nim jika ada, jika tidak gunakan id
      data: { kehadiran },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error updating attendance:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
