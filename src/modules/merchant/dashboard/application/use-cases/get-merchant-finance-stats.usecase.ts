import { Injectable } from '@nestjs/common';
import { WalletFacade } from '@/modules/wallet/application/wallet.facade';

@Injectable()
export class GetMerchantFinanceStatsUseCase {
  constructor(private readonly walletFacade: WalletFacade) {}

  async execute(userId: number) {
    console.log('[FINANCE_STATS] Executing for userId:', userId);
    try {
      const [wallet, earnings, withdrawalsStatus] = await Promise.all([
        this.walletFacade.getWallet(userId),
        this.walletFacade.getTotalEarnings(userId),
        this.walletFacade.getWithdrawalsStatus(userId),
      ]);

      console.log('[FINANCE_STATS] Data retrieved:', { wallet, earnings, withdrawalsStatus });

      // Calculate next payout date (Next Monday at 10 AM)
      const nextPayoutDate = new Date();
      const daysUntilMonday = (1 + 7 - nextPayoutDate.getDay()) % 7 || 7;
      nextPayoutDate.setDate(nextPayoutDate.getDate() + daysUntilMonday);
      nextPayoutDate.setHours(10, 0, 0, 0);

      const result = {
        totalEarnings: Number(earnings) || 0,
        availableBalance: Number(wallet?.balance) || 0,
        pendingPayout: Number(withdrawalsStatus?.pendingWithdrawals) || 0,
        totalPayouts: Number(withdrawalsStatus?.totalWithdrawn) || 0,
        nextPayoutDate: nextPayoutDate.toISOString(),
      };
      
      console.log('[FINANCE_STATS] Final Result:', result);
      return result;
    } catch (error) {
      console.error('[FINANCE_STATS] Error in use case:', error);
      throw error;
    }
  }
}
