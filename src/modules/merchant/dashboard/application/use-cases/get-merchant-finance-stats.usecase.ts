import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletFacade } from '@/modules/wallet/application/wallet.facade';
import { OrderFacade } from '@/modules/commerce/order/application/order.facade';
import { ProfileMerchant } from '@/modules/merchant/profile/infrastructure/entities/profile-merchant.entity';

@Injectable()
export class GetMerchantFinanceStatsUseCase {
  constructor(
    @Inject(forwardRef(() => WalletFacade))
    private readonly walletFacade: WalletFacade,
    private readonly orderFacade: OrderFacade,
    @InjectRepository(ProfileMerchant)
    private readonly merchantRepo: Repository<ProfileMerchant>,
  ) {}

  async execute(userId: string) {
    console.log('[FINANCE_STATS] Executing for userId:', userId);
    try {
      // Resolve merchant profile ID from user ID
      const merchantProfile = await this.merchantRepo.findOne({
        where: { user_id: userId as any },
        select: ['id'],
      });
      const merchantId = merchantProfile?.id;

      const [wallet, actual_earnings, withdrawalsStatus, grossEarnings] = await Promise.all([
        this.walletFacade.getWallet(userId as any),
        this.walletFacade.getTotalEarnings(userId),
        this.walletFacade.getWithdrawalsStatus(userId as any),
        merchantId
          ? this.orderFacade.getMerchantGrossTotalEarnings(merchantId)
          : Promise.resolve(0),
      ]);
      
      const platformFeeRate = await this.walletFacade.getAdminCommissionFromSetting('COMMISION_FROM_PUJA_SHOP');
      const gstRate = await this.walletFacade.getAdminCommissionFromSetting('GST_PERCENTAGE');
      
      const estimatedFee = grossEarnings * (platformFeeRate / 100);
      const estimatedGst = estimatedFee * (gstRate / 100);
      const netEarnings = grossEarnings - estimatedFee - estimatedGst;

      console.log('[FINANCE_STATS] Data retrieved:', { wallet, actual_earnings, withdrawalsStatus, grossEarnings, netEarnings });

      // Calculate next payout date (Next Monday at 10 AM)
      const next_payout_date = new Date();
      const daysUntilMonday = (1 + 7 - next_payout_date.getDay()) % 7 || 7;
      next_payout_date.setDate(next_payout_date.getDate() + daysUntilMonday);
      next_payout_date.setHours(10, 0, 0, 0);

      const result = {
        total_earnings: Number(netEarnings.toFixed(2)),
        actual_earnings: Number(actual_earnings) || 0,
        available_balance: Number(wallet?.balance) || 0,
        pendingPayout: Number(withdrawalsStatus?.pending_amount) || 0,
        processing_amount: Number(withdrawalsStatus?.processing_amount) || 0,
        total_payouts: Number(withdrawalsStatus?.total_withdrawn) || 0,
        next_payout_date: next_payout_date.toISOString(),
      };
      
      console.log('[FINANCE_STATS] Final Result:', result);
      return result;
    } catch (error) {
      console.error('[FINANCE_STATS] Error in use case:', error);
      throw error;
    }
  }
}
