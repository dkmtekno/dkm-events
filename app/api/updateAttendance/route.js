import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function PUT(req) {
  try {
    const { nim, kehadiran } = await req.json();

    if (!nim) {
      return NextResponse.json(
        { error: "NIM diperlukan" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { nim },
      data: { kehadiran },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
