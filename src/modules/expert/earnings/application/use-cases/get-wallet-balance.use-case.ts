import { Injectable } from '@nestjs/common';
import { WalletFacade } from '@/modules/wallet/application/wallet.facade';

@Injectable()
export class GetWalletBalanceUseCase {
  constructor(private readonly walletFacade: WalletFacade) {}

  async execute(userId: string) {
    const balance = await this.walletFacade.getBalance(userId);
    const stats = await this.walletFacade.getWithdrawalsStatus(userId);
    const total_earnings = await this.walletFacade.getTotalEarnings(userId);

    return {
      available_balance: balance,
      total_earnings: total_earnings,
      ...stats,
    };
  }
}
