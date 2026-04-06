import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { OrderItem } from '@/modules/order/infrastructure/persistence/entities/order-item.entity';
import { Product } from '@/modules/product/infrastructure/persistence/entities/product.entity';

@Injectable()
export class GetMerchantStatsUseCase {
  constructor(
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async execute(userId: number) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Today's Orders (Distinct order_id where product.merchant_id = userId)
    const todayOrdersQuery = await this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .where('p.merchant_id = :userId', { userId })
      .andWhere('oi.created_at >= :startOfToday', { startOfToday })
      .select('COUNT(DISTINCT oi.order_id)', 'count')
      .getRawOne();

    // 2. Total Products
    const totalProducts = await this.productRepo.count({
      where: { merchant_id: userId },
    });

    // 3. Monthly Earnings (Sum of price * quantity where product.merchant_id = userId)
    const monthlyEarningsQuery = await this.orderItemRepo
      .createQueryBuilder('oi')
      .innerJoin('oi.product', 'p')
      .where('p.merchant_id = :userId', { userId })
      .andWhere('oi.created_at >= :startOfMonth', { startOfMonth })
      .select('SUM(oi.price * oi.quantity)', 'sum')
      .getRawOne();

    return {
      todayOrders: { value: Number(todayOrdersQuery.count) || 0, trend: '+12%' },
      totalProducts: { value: totalProducts, trend: '+2 new' },
      shopFollowers: { value: 1250, trend: '+48' }, // Mocked
      monthlyEarnings: {
        value: `₹${Number(monthlyEarningsQuery.sum).toLocaleString() || 0}`,
        trend: '+8%',
      },
    };
  }
}
