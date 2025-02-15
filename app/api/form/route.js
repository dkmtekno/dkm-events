import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    const users = await prisma.user.findMany();
    return Response.json(users);
  }

export async function POST(req) {
  try {
    const body = await req.json();
    const { nama, prodi, nim, status, angkatan } = body;

    const newUser = await prisma.user.create({
      data: {
        nama,
        prodi,
        nim,
        status,
        angkatan: status === 'Panitia' ? angkatan : null,
      },
    });

    return Response.json(newUser, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Terjadi kesalahan saat menyimpan data' }, { status: 500 });
  }
}
