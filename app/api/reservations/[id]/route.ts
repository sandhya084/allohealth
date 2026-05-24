import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const id = url.pathname.split('/').pop() || ''
  const res = await prisma.reservation.findUnique({ where: { id } })
  if (!res) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(res)
}
