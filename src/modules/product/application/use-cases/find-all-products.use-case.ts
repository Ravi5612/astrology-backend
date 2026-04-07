import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../infrastructure/persistence/entities/product.entity';

@Injectable()
export class FindAllProductsUseCase {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }

  async execute(filters: { merchantId?: number; expertId?: number; page?: number; limit?: number }) {
    const { merchantId, expertId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query = this.productRepository.createQueryBuilder('product')
      .where('product.is_active = :isActive', { isActive: true });

    if (merchantId) {
      query.andWhere('product.merchant_id = :merchantId', { merchantId });
    }

    if (expertId) {
      query.andWhere('product.expert_id = :expertId', { expertId });
    }

    const [products, total] = await query
      .orderBy('product.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      success: true,
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
