import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const products = [
  {
    name: 'Premium Laptop',
    description: 'Powerful laptop for work, study and entertainment.',
    price: 799,
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Smartphone Pro',
    description: 'Modern smartphone with powerful performance.',
    price: 499,
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Wireless Headphones',
    description: 'Premium sound with comfortable wireless design.',
    price: 99,
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Smart Watch',
    description: 'Track your fitness, health and daily activities.',
    price: 149,
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Modern Camera',
    description: 'Capture beautiful moments with high-quality images.',
    price: 699,
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Gaming Keyboard',
    description: 'Mechanical keyboard designed for serious gamers.',
    price: 79,
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Wireless Speaker',
    description: 'Powerful sound in a compact portable design.',
    price: 129,
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Gaming Mouse',
    description: 'Fast and precise mouse for gaming and work.',
    price: 49,
    stock: 10,
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80',
  },
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@shopease.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'ShopEase Admin',
      password: adminPasswordHash,
      role: 'ADMIN',
    },
    create: {
      name: 'ShopEase Admin',
      email: adminEmail,
      password: adminPasswordHash,
      role: 'ADMIN',
    },
  });

  for (const product of products) {
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: product.name,
      },
    });

    if (existingProduct) {
      await prisma.product.update({
        where: {
          id: existingProduct.id,
        },
        data: product,
      });
    } else {
      await prisma.product.create({
        data: product,
      });
    }
  }

  console.log(`Seeded ${products.length} products and admin ${adminEmail}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
