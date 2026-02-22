import { Injectable } from '@nestjs/common';
import { CreateReviewUseCase } from './use-cases/create-review.use-case';
import { GetExpertReviewsUseCase } from './use-cases/get-expert-reviews.use-case';
import { GetReviewsStatsUseCase } from './use-cases/get-reviews-stats.use-case';
import { CreateReviewDto } from '../api/dto/create-review.dto';

@Injectable()
export class ReviewsFacade {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly getExpertReviewsUseCase: GetExpertReviewsUseCase,
    private readonly getReviewsStatsUseCase: GetReviewsStatsUseCase,
  ) {}

  async createReview(userId: number, dto: CreateReviewDto) {
    return this.createReviewUseCase.execute(userId, dto);
  }

  async getExpertReviews(expertId: number, page: number = 1, limit: number = 20) {
    return this.getExpertReviewsUseCase.execute(expertId, page, limit);
  }

  async getReviewsStats(expertId: number) {
    return this.getReviewsStatsUseCase.execute(expertId);
  }
}
