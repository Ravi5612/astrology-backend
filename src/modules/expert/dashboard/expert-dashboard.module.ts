import { Module } from '@nestjs/common';
import { ExpertDashboardController } from './api/controllers/expert-dashboard.controller';
import { GetDashboardStatsUseCase } from './application/use-cases/get-dashboard-stats.use-case';
import { ExpertDashboardFacade } from './application/expert-dashboard.facade';
import { WalletModule } from '@/modules/wallet/wallet.module';
import { ProfileModule } from '@/modules/expert/profile/profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallSession } from '@/modules/consultation/call/infrastructure/entities/call-session.entity';
import { ConsultationModule } from '@/modules/consultation/consultation.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([CallSession]),
        ConsultationModule,
        WalletModule,
        ProfileModule,
    ],
    controllers: [ExpertDashboardController],
    providers: [
        ExpertDashboardFacade,
        GetDashboardStatsUseCase,
    ],
})
export class ExpertDashboardModule { }
