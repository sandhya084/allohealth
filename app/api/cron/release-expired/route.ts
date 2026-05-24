import { NextResponse } from 'next/server'
import { releaseExpiredReservations } from '../../../../services/reservationService'

export async function POST() {
  try {
    const res = await releaseExpiredReservations()
    return NextResponse.json(res)
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Invalid' }, { status: 500 })
  }
}
