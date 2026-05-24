import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      inventories: { include: { warehouse: true } }
    }
  })

  const mapped = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    description: p.description,
    inventories: p.inventories.map((i) => ({
      warehouseId: i.warehouseId,
      warehouseName: i.warehouse.name,
      totalUnits: i.totalUnits,
      reservedUnits: i.reservedUnits,
      available: i.totalUnits - i.reservedUnits
    }))
  }))

  return NextResponse.json(mapped)
}
