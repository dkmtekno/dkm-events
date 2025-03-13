import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const nim = searchParams.get("nim");

    if (!nim) {
      return NextResponse.json({ error: "NIM tidak valid" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { nim },
    });

    return NextResponse.json({ exists: !!existingUser });
  } catch (error) {
    console.error("Error checking NIM:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengecek NIM" },
      { status: 500 }
    );
  }
}
