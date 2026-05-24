import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create warehouses
  const w1 = await prisma.warehouse.upsert({
    where: { name: 'US-East' },
    update: {},
    create: { name: 'US-East', location: 'Virginia' }
  })

  const w2 = await prisma.warehouse.upsert({
    where: { name: 'EU-West' },
    update: {},
    create: { name: 'EU-West', location: 'Frankfurt' }
  })

  const p1 = await prisma.product.upsert({
    where: { sku: 'SKU-001' },
    update: {},
    create: { sku: 'SKU-001', name: 'Widget', description: 'A useful widget' }
  })

  const p2 = await prisma.product.upsert({
    where: { sku: 'SKU-002' },
    update: {},
    create: { sku: 'SKU-002', name: 'Gadget', description: 'A fancy gadget' }
  })

  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: p1.id, warehouseId: w1.id } },
    update: {},
    create: { productId: p1.id, warehouseId: w1.id, totalUnits: 5, reservedUnits: 0 }
  })

  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: p1.id, warehouseId: w2.id } },
    update: {},
    create: { productId: p1.id, warehouseId: w2.id, totalUnits: 3, reservedUnits: 0 }
  })

  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: p2.id, warehouseId: w1.id } },
    update: {},
    create: { productId: p2.id, warehouseId: w1.id, totalUnits: 10, reservedUnits: 0 }
  })

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
