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

    const whereClause = id ? { id } : { nim };

    const existing = await prisma.user.findUnique({
      where: whereClause,
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Data peserta tidak ditemukan." },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: whereClause,
      data: { kehadiran: kehadiran !== undefined ? Boolean(kehadiran) : true },
    });

    return NextResponse.json(
      {
        ...updatedUser,
        user: updatedUser,
        wasAlreadyPresent: existing.kehadiran,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating attendance:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui kehadiran", details: error.message },
      { status: 500 }
    );
  }
}
