import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma  = new PrismaClient({ adapter })

async function main() {
  // ── Districts ───────────────────────────────────────────────
  await prisma.district.createMany({
    data: [
      { name: 'Ranchi',      nameHi: 'रांची' },
      { name: 'Dhanbad',     nameHi: 'धनबाद' },
      { name: 'Bokaro',      nameHi: 'बोकारो' },
      { name: 'Deoghar',     nameHi: 'देवघर' },
      { name: 'Hazaribagh',  nameHi: 'हजारीबाग' },
      { name: 'Giridih',     nameHi: 'गिरिडीह' },
      { name: 'Dumka',       nameHi: 'दुमका' },
      { name: 'Jamshedpur',  nameHi: 'जमशेदपुर' },
    ],
    skipDuplicates: true,
  })
  console.log('✓ Districts seeded')

  const ranchi = await prisma.district.findFirst({ where: { name: 'Ranchi' } })

  // ── Test users ──────────────────────────────────────────────
  const users = [
    {
      phone: '9000000001',
      name: 'Admin User',
      role: 'ADMIN' as const,
      password: await bcrypt.hash('admin123', 12),
    },
    {
      phone: '9000000002',
      name: 'Regional Head Ranchi',
      role: 'REGIONAL_HEAD' as const,
      password: await bcrypt.hash('regional123', 12),
      districtId: ranchi?.id,
    },
    {
      phone: '9000000003',
      name: 'BIT Mesra Representative',
      role: 'UNIVERSITY' as const,
      password: await bcrypt.hash('university123', 12),
      orgName: 'BIT Mesra',
    },
    {
      phone: '9000000004',
      name: 'Tata Steel Representative',
      role: 'INDUSTRY' as const,
      password: await bcrypt.hash('industry123', 12),
      orgName: 'Tata Steel Ltd.',
    },
    {
      phone: '9000000005',
      name: 'Ramu Kumar',
      role: 'CITIZEN' as const,
      password: await bcrypt.hash('citizen123', 12),
      districtId: ranchi?.id,
    },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { phone: u.phone },
      update: {},
      create: u,
    })
  }
  console.log('✓ Test users seeded')
  console.log('')
  console.log('  Demo credentials:')
  console.log('  Admin         → 9000000001 / admin123')
  console.log('  Regional Head → 9000000002 / regional123')
  console.log('  University    → 9000000003 / university123')
  console.log('  Industry      → 9000000004 / industry123')
  console.log('  Citizen       → 9000000005 / citizen123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
