import prisma from '../lib/prisma'
import { ReservationStatus } from '@prisma/client'

const RESERVATION_TTL_MINUTES = 10

export async function reserveInventory(productId: string, warehouseId: string, quantity: number) {
  if (quantity <= 0) throw new Error('Quantity must be > 0')

  return await prisma.$transaction(async (tx) => {
    // Lock the inventory row using raw SQL FOR UPDATE to ensure concurrency safety
    const rows: any[] = await tx.$queryRawUnsafe(
      `SELECT id, "totalUnits", "reservedUnits" FROM "Inventory" WHERE "productId" = $1 AND "warehouseId" = $2 FOR UPDATE`,
      productId,
      warehouseId
    )

    if (rows.length === 0) {
      throw new Error('Inventory not found')
    }

    const inv = rows[0]
    const available = inv.totalUnits - inv.reservedUnits
    if (available < quantity) {
      const err: any = new Error('Insufficient stock')
      err.code = 'INSUFFICIENT'
      throw err
    }

    // increment reservedUnits
    await tx.inventory.update({ where: { id: inv.id }, data: { reservedUnits: { increment: quantity } } })

    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60_000)

    const reservation = await tx.reservation.create({
      data: {
        inventoryId: inv.id,
        productId,
        warehouseId,
        quantity,
        expiresAt,
        status: ReservationStatus.PENDING
      }
    })

    return { reservationId: reservation.id, expiresAt }
  })
}

export async function confirmReservation(reservationId: string) {
  return await prisma.$transaction(async (tx) => {
    const res = await tx.reservation.findUnique({ where: { id: reservationId } })
    if (!res) throw new Error('NotFound')
    if (res.status !== ReservationStatus.PENDING) throw new Error('InvalidStatus')
    if (res.expiresAt.getTime() <= Date.now()) {
      throw new Error('Expired')
    }

    // At confirmation we commit the reservation: reservedUnits already counted, so just update status
    await tx.reservation.update({ where: { id: reservationId }, data: { status: ReservationStatus.CONFIRMED } })
    return { ok: true }
  })
}

export async function releaseReservation(reservationId: string) {
  return await prisma.$transaction(async (tx) => {
    const res = await tx.reservation.findUnique({ where: { id: reservationId } })
    if (!res) throw new Error('NotFound')
    if (res.status !== ReservationStatus.PENDING) return { ok: true }

    // lock inventory row to safely decrement reservedUnits
    const rows: any[] = await tx.$queryRawUnsafe(
      `SELECT id, "reservedUnits" FROM "Inventory" WHERE id = $1 FOR UPDATE`,
      res.inventoryId
    )
    if (rows.length === 0) throw new Error('InventoryNotFound')

    await tx.inventory.update({ where: { id: res.inventoryId }, data: { reservedUnits: { decrement: res.quantity } } })
    await tx.reservation.update({ where: { id: reservationId }, data: { status: ReservationStatus.RELEASED } })
    return { ok: true }
  })
}

export async function releaseExpiredReservations() {
  const now = new Date()
  return await prisma.$transaction(async (tx) => {
    const expired = await tx.reservation.findMany({ where: { status: ReservationStatus.PENDING, expiresAt: { lt: now } } })
    for (const r of expired) {
      // lock inventory row
      await tx.$queryRawUnsafe(`SELECT id FROM "Inventory" WHERE id = $1 FOR UPDATE`, r.inventoryId)
      await tx.inventory.update({ where: { id: r.inventoryId }, data: { reservedUnits: { decrement: r.quantity } } })
      await tx.reservation.update({ where: { id: r.id }, data: { status: ReservationStatus.EXPIRED } })
    }

    return { released: expired.length }
  })
}
