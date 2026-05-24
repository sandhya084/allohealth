import 'dotenv/config'

async function main() {
  const base = process.env.TEST_BASE_URL || 'http://localhost:3000'
  console.log('Using base URL:', base)

  // fetch products and pick first available inventory
  const prodRes = await fetch(`${base}/api/products`)
  const products = await prodRes.json()
  if (!products.length) {
    console.error('No products found')
    process.exit(1)
  }

  let target: { productId: string; warehouseId: string } | null = null
  for (const p of products) {
    for (const i of p.inventories) {
      if (i.available > 0) {
        target = { productId: p.id, warehouseId: i.warehouseId }
        break
      }
    }
    if (target) break
  }

  if (!target) {
    console.error('No available inventory to test')
    process.exit(1)
  }

  console.log('Targeting', target)

  const doReserve = () => fetch(`${base}/api/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: target!.productId, warehouseId: target!.warehouseId, quantity: 1 })
  })

  // run two concurrent requests
  const [a, b] = await Promise.all([doReserve(), doReserve()])
  console.log('Response A:', a.status, await a.text())
  console.log('Response B:', b.status, await b.text())
}

main().catch((e) => { console.error(e); process.exit(1) })
