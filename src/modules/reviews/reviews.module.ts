import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './api/controllers/reviews.controller';
import { Review } from './infrastructure/persistence/entities/review.entity';
import { ProfileExpert } from '@/modules/expert/profile/infrastructure/persistence/entities/profile-expert.entity';
import { ChatSession } from '@/modules/chat/infrastructure/persistence/entities/chat-session.entity';
import { WalletModule } from '@/modules/wallet/wallet.module';

import { ReviewsFacade } from './application/reviews.facade';
import { CreateReviewUseCase } from './application/use-cases/create-review.use-case';
import { GetExpertReviewsUseCase } from './application/use-cases/get-expert-reviews.use-case';
import { GetReviewsStatsUseCase } from './application/use-cases/get-reviews-stats.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ProfileExpert, ChatSession])],
  controllers: [ReviewsController],
  providers: [
    ReviewsFacade,
    CreateReviewUseCase,
    GetExpertReviewsUseCase,
    GetReviewsStatsUseCase,
  ],
  exports: [ReviewsFacade],
})
export class ReviewsModule {}
