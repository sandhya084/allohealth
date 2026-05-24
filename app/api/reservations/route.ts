import { NextResponse } from 'next/server'
import { z } from 'zod'
import { reserveInventory } from '../../../services/reservationService'

const bodySchema = z.object({ productId: z.string(), warehouseId: z.string(), quantity: z.number().int().positive() })

export async function POST(req: Request) {
  try {
    let body: any
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await req.formData()
      body = {
        productId: form.get('productId') as string,
        warehouseId: form.get('warehouseId') as string,
        quantity: Number(form.get('quantity'))
      }
    } else {
      // attempt json parse
      body = await req.json().catch(() => ({}))
    }

    const { productId, warehouseId, quantity } = bodySchema.parse(body)

    const res = await reserveInventory(productId, warehouseId, quantity)

    // If called from a form submit, redirect to reservation page using an absolute URL
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const origin = new URL(req.url).origin
      return NextResponse.redirect(new URL(`/reservation/${res.reservationId}`, origin).toString())
    }

    return NextResponse.json(res, { status: 201 })
  } catch (err: any) {
    if (err?.code === 'INSUFFICIENT') return NextResponse.json({ error: 'Insufficient stock' }, { status: 409 })
    if (err?.message === 'Inventory not found') return NextResponse.json({ error: 'Inventory not found' }, { status: 404 })
    return NextResponse.json({ error: err.message ?? 'Invalid' }, { status: 400 })
  }
}

