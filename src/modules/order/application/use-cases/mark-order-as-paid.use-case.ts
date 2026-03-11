import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from '../../infrastructure/persistence/entities/order.entity';
import { ProfileClient } from '@/modules/client/profile/infrastructure/persistence/entities/profile-client.entity';
import { ProfileExpert } from '@/modules/expert/profile/infrastructure/persistence/entities/profile-expert.entity';

@Injectable()
export class MarkOrderAsPaidUseCase {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    private dataSource: DataSource,
  ) { }

  async execute(razorpayOrderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { razorpay_order_id: razorpayOrderId },
        relations: ['items', 'items.product'],
      });

      if (!order || order.status === OrderStatus.PAID) {
        await queryRunner.rollbackTransaction();
        return;
      }

      // 1. Mark Order as Paid
      order.status = OrderStatus.PAID;
      await queryRunner.manager.save(order);

      // 2. Track Client Spending
      const clientProfile = await queryRunner.manager.findOne(ProfileClient, {
        where: { user: { id: order.user_id } },
        lock: { mode: 'pessimistic_write' },
      });

      if (clientProfile) {
        clientProfile.total_spending = Number(clientProfile.total_spending || 0) + Number(order.total_amount);
        await queryRunner.manager.save(clientProfile);
      }

      // 3. Track Expert Earnings (Iterate over items)
      for (const item of order.items) {
        if (item.product && item.product.expert_id) {
          const expertProfile = await queryRunner.manager.findOne(ProfileExpert, {
            where: { id: item.product.expert_id },
            lock: { mode: 'pessimistic_write' },
          });

          if (expertProfile) {
            const itemTotal = Number(item.price) * (item.quantity || 1);
            expertProfile.total_earning = Number(expertProfile.total_earning || 0) + itemTotal;
            await queryRunner.manager.save(expertProfile);
          }
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
