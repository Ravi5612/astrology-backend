import { Module } from '@nestjs/common';
import { ProfileModule } from './profile/profile.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { ExpertEarningsModule } from './earnings/expert-earnings.module';
import { ExpertDashboardModule } from './dashboard/expert-dashboard.module';

@Module({
  imports: [ProfileModule, BankAccountsModule, ExpertEarningsModule, ExpertDashboardModule],
  exports: [ProfileModule, BankAccountsModule, ExpertEarningsModule, ExpertDashboardModule]
})
export class ExpertModule { }
