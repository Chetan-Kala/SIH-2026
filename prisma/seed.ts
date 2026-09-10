import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  await prisma.district.createMany({
    data: [
      { name: 'Ranchi', nameHi: 'रांची' },
      { name: 'Dhanbad', nameHi: 'धनबाद' },
      { name: 'Bokaro', nameHi: 'बोकारो' },
      { name: 'Deoghar', nameHi: 'देवघर' },
      { name: 'Hazaribagh', nameHi: 'हजारीबाग' },
      { name: 'Giridih', nameHi: 'गिरिडीह' },
      { name: 'Dumka', nameHi: 'दुमका' },
      { name: 'Jamshedpur', nameHi: 'जमशेदपुर' },
    ],
    skipDuplicates: true,
  })
  console.log('Districts seeded')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
