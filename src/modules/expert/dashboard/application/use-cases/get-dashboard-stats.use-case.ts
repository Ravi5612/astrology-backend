import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ChatFacade } from '@/modules/consultation/chat/application/chat.facade';
import { WalletFacade } from '@/modules/wallet/application/wallet.facade';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';
import { ReviewsFacade } from '@/modules/consultation/reviews/application/reviews.facade';
import { DashboardPolicy } from '../../domain/policies/dashboard.policy';
import { ChatSessionStatus } from '@/modules/consultation/chat/infrastructure/entities/chat-session.entity';
import { CallFacade } from '@/modules/consultation/call/application/call.facade';

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    @Inject(forwardRef(() => ChatFacade))
    private readonly chatFacade: ChatFacade,
    @Inject(forwardRef(() => WalletFacade))
    private readonly walletFacade: WalletFacade,
    @Inject(forwardRef(() => ExpertProfileFacade))
    private readonly profileFacade: ExpertProfileFacade,
    private readonly reviewsFacade: ReviewsFacade,
    @Inject(forwardRef(() => CallFacade))
    private readonly callFacade: CallFacade,
  ) { }

  async execute(userId: string, type: 'today' | 'total' = 'today') {
    const expertProfile = await this.profileFacade.getExpertByUserId(userId);

    DashboardPolicy.ensureProfileExists(expertProfile);

    const expert_id = expertProfile.id;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const reviewStats = await this.reviewsFacade.getReviewsStats(expert_id as any);

    if (type === 'today') {
      const todayChatAppointments = await this.chatFacade.getExpertSessionCount(expert_id as any, {
        startDate: startOfToday,
      });
      const todayCallAppointments = await this.callFacade.getExpertSessionCount(expert_id as any, {
        startDate: startOfToday,
      });

      const completedToday = await this.chatFacade.getExpertSessionCount(expert_id as any, {
        status: 'completed' as any,
        startDate: startOfToday,
      });
      const completedCallsToday = await this.callFacade.getExpertSessionCount(expert_id as any, {
        status: 'completed' as any,
        startDate: startOfToday,
      });

      const expiredToday = await this.chatFacade.getExpertSessionCount(expert_id as any, {
        status: ['expired', 'cancelled'] as any,
        startDate: startOfToday,
      });
      const expiredCallsToday = await this.callFacade.getExpertSessionCount(expert_id as any, {
        status: ['expired', 'cancelled', 'rejected'] as any,
        startDate: startOfToday,
      });

      const todayEarnings = await this.walletFacade.getTotalEarnings(userId, {
        startDate: startOfToday,
      });

      const wallet_balance = await this.walletFacade.getBalance(userId as any);

      return {
        today_appointments: todayChatAppointments + todayCallAppointments,
        completed_today: completedToday + completedCallsToday,
        expired_today: expiredToday + expiredCallsToday,
        today_earnings: todayEarnings,
        wallet_balance: wallet_balance,
        average_rating: reviewStats?.rating || 0,
        total_reviews: reviewStats?.totalReviews || 0,
        total_chat_sessions: todayChatAppointments + todayCallAppointments,
      };
    } else {
      const totalChatAppointments = await this.chatFacade.getExpertSessionCount(expert_id as any);
      const totalCallAppointments = await this.callFacade.getExpertSessionCount(expert_id as any);

      const totalCompleted = await this.chatFacade.getExpertSessionCount(expert_id as any, {
        status: 'completed' as any,
      });
      const totalCompletedCalls = await this.callFacade.getExpertSessionCount(expert_id as any, {
        status: 'completed' as any,
      });

      const totalExpired = await this.chatFacade.getExpertSessionCount(expert_id as any, {
        status: ['expired', 'cancelled'] as any,
      });
      const totalExpiredCalls = await this.callFacade.getExpertSessionCount(expert_id as any, {
        status: ['expired', 'cancelled', 'rejected'] as any,
      });

      const total_earnings = await this.walletFacade.getTotalEarnings(userId);
      const wallet_balance = await this.walletFacade.getBalance(userId as any);

      return {
        total_appointments: totalChatAppointments + totalCallAppointments,
        total_completed: totalCompleted + totalCompletedCalls,
        total_expired: totalExpired + totalExpiredCalls,
        total_earnings: total_earnings,
        wallet_balance: wallet_balance,
        average_rating: reviewStats?.rating || 0,
        total_reviews: reviewStats?.totalReviews || 0,
        total_chat_sessions: totalChatAppointments + totalCallAppointments,
      };
    }
  }
}
