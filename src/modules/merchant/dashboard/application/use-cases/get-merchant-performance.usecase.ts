import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewsFacade } from '@/modules/consultation/reviews/application/reviews.facade';
import { OrderFacade } from '@/modules/commerce/order/application/order.facade';
import { ProfileMerchant } from '@/modules/merchant/profile/infrastructure/entities/profile-merchant.entity';

import * as fs from 'fs';

@Injectable()
export class GetMerchantPerformanceUseCase {
  constructor(
    @Inject(forwardRef(() => ReviewsFacade))
    private readonly reviewsFacade: ReviewsFacade,
    private readonly orderFacade: OrderFacade,
    @InjectRepository(ProfileMerchant)
    private readonly profileRepo: Repository<ProfileMerchant>,
  ) {}

  async execute(userId: string) {
    const profile = await this.profileRepo.findOne({
      where: { id: userId as any },
    });

    if (!profile) {
      return {
        average_rating: 0,
        totalReviews: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        weekly_target_progress: 0,
        current_tier: 'Bronze',
        sales_data: [],
      };
    }

    const merchantId = profile.id;

    // 1. Rating Stats
    const statsResult = await this.reviewsFacade.getMerchantReviewsStats(merchantId);
    
    const distribution = statsResult?.distribution || { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

    // 2. Sales Chart Data (Last 7 Days)
    const salesResult = await this.orderFacade.getMerchantRevenueTimeline(merchantId);

    console.log(`[PERFORMANCE_DEBUG] Fetching for userId: ${userId}, merchantId: ${merchantId}`);
    console.log(`[PERFORMANCE_DEBUG] Raw query items: ${salesResult.length}`);
    console.log(`[PERFORMANCE_DEBUG] Raw results:`, JSON.stringify(salesResult));

    // Map to 7-day structure
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      days.push(`${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]} ${d.getDate()}`);
    }

    const sales_data = days.map(day => {
      const found = salesResult.find(s => s.date === day);
      return {
        date: day,
        sales: found ? parseFloat(found.revenue) : 0,
      };
    });

    console.log(`[PERFORMANCE_DEBUG] Final sales_data:`, JSON.stringify(sales_data));

    return {
      average_rating: statsResult?.average_rating || 0,
      totalReviews: statsResult?.totalReviews || 0,
      rating_distribution: distribution,
      weekly_target_progress: 45,
      current_tier: profile.isVerified ? 'Silver' : 'Bronze',
      sales_data,
    };
  }
}
