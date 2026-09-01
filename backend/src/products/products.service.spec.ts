import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: {
    product: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      product: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update an existing product', async () => {
    const product = {
      id: 1,
      name: 'Laptop',
      description: 'Gaming',
      price: 1000,
      stock: 5,
    };
    prisma.product.findUnique.mockResolvedValue(product);
    prisma.product.update.mockResolvedValue({
      ...product,
      name: 'Updated Laptop',
    });

    await expect(
      service.update(1, {
        name: 'Updated Laptop',
        description: 'Gaming',
        price: 1000,
        stock: 5,
      }),
    ).resolves.toEqual({ ...product, name: 'Updated Laptop' });

    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        name: 'Updated Laptop',
        description: 'Gaming',
        price: 1000,
        stock: 5,
      },
    });
  });
});
