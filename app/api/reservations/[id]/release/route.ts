import { NextResponse } from 'next/server'
import { releaseReservation } from '../../../../../services/reservationService'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const parts = url.pathname.split('/').filter(Boolean)
    const id = parts[parts.length - 2] || ''
    await releaseReservation(id)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err?.message === 'NotFound') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: err.message ?? 'Invalid' }, { status: 400 })
  }
}
