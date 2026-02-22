import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../infrastructure/persistence/entities/product.entity';

@Injectable()
export class FindAllProductsUseCase {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async execute(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.name',
        'product.description',
        'product.price',
        'product.originalPrice',
        'product.imageUrl',
        'product.isActive',
      ])
      .where('product.isActive = :isActive', { isActive: true })
      .getMany();
  }
}
