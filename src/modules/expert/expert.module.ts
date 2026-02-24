import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { ExpertEarningsModule } from './earnings/expert-earnings.module';

@Module({
  imports: [ProfileModule, BankAccountsModule, ExpertEarningsModule],
  exports: [ProfileModule, BankAccountsModule, ExpertEarningsModule]
})
export class ExpertModule { }
