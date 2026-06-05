import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger, Inject, forwardRef } from '@nestjs/common';
import { WalletFacade } from '@/modules/wallet/application/wallet.facade';
import { OrderFacade } from '@/modules/commerce/order/application/order.facade';
import { OrderStatus } from '@/modules/commerce/order/infrastructure/entities/order.entity';

@Injectable()
export class VerifyOrderOtpUseCase {
  private readonly logger = new Logger(VerifyOrderOtpUseCase.name);

  constructor(
    private readonly orderFacade: OrderFacade,
    @Inject(forwardRef(() => WalletFacade))
    private readonly walletFacade: WalletFacade,
  ) {}

  async execute(merchantUserId: string, orderId: number, otp: string) {
    const { netPayout } = await this.orderFacade.verifyOrderOtp(orderId, otp, merchantUserId, this.walletFacade);

    // 5. Update Status via Central Facade (Handles all commissions and settlements)
    await this.orderFacade.updateOrderStatus(orderId as any, OrderStatus.DELIVERED, undefined, merchantUserId as any);

    return {
      success: true,
      message: 'Order delivered and payment settled successfully',
      payoutAmount: netPayout,
    };
  }
}
