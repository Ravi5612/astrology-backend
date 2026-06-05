import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderFacade } from '@/modules/commerce/order/application/order.facade';
import { ProfileMerchant } from '@/modules/merchant/profile/infrastructure/entities/profile-merchant.entity';

@Injectable()
export class GetRecentOrdersUseCase {
  constructor(
    private readonly orderFacade: OrderFacade,
    @InjectRepository(ProfileMerchant)
    private readonly profileRepo: Repository<ProfileMerchant>,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileRepo.findOne({
      where: { user_id: userId as any },
    });
    
    if (!profile) return [];

    const merchantId = profile.id;

    console.log('[RECENT_ORDERS] Request for userId:', userId);
    const recentOrderItems = await this.orderFacade.getMerchantRecentOrders(merchantId, 10);

    return recentOrderItems.map((item) => ({
      id: item.order.id.toString(),
      customerName: (item.order as any).client?.user?.name || 'Guest',
      amount: Number(item.price) * item.quantity,
      status: item.order.status,
      date: item.order.created_at.toISOString(),
      productName: item.product.name,
    }));
  }
}
