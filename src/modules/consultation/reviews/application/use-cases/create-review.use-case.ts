
import { Injectable, Inject, forwardRef, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from '../../infrastructure/entities/review.entity';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';
import { MerchantProfileFacade } from '@/modules/merchant/profile/application/profile.facade';
import { ClientProfileFacade } from '@/modules/client/profile/application/profile.facade';
import { OrderFacade } from '@/modules/commerce/order/application/order.facade';
import { ChatSession } from '@/modules/consultation/chat/infrastructure/entities/chat-session.entity';
import { CallSession } from '@/modules/consultation/call/infrastructure/entities/call-session.entity';
import { CreateReviewDto } from '../../api/dto/create-review.dto';

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ChatSession)
    private readonly chatSessionRepository: Repository<ChatSession>,
    @InjectRepository(CallSession)
    private readonly callSessionRepository: Repository<CallSession>,
    @Inject(forwardRef(() => ExpertProfileFacade))
    private readonly expertProfileFacade: ExpertProfileFacade,
    @Inject(forwardRef(() => MerchantProfileFacade))
    private readonly merchantProfileFacade: MerchantProfileFacade,
    @Inject(forwardRef(() => ClientProfileFacade))
    private readonly clientProfileFacade: ClientProfileFacade,
    @Inject(forwardRef(() => OrderFacade))
    private readonly orderFacade: OrderFacade,
    private readonly dataSource: DataSource,
  ) { }

  async execute(userId: string, dto: CreateReviewDto): Promise<Review> {
    const { expert_id, merchantId, orderId, sessionId, rating, comment, tags, review_type } = dto;

    if (review_type === 'platform') {
      return this.handlePlatformReview(userId, rating, comment, tags);
    }

    if (!expert_id && !merchantId) {
      throw new BadRequestException('Either expert_id or merchantId must be provided for expert/shop reviews');
    }

    const client = await this.clientProfileFacade.getProfile(userId);
    if (!client) {
      throw new BadRequestException('Client profile not found for this user');
    }
    const actualClientId = client.id;

    if (expert_id) {
      return this.handleExpertReview(userId, actualClientId, expert_id, sessionId ?? undefined, rating, comment, tags);
    } else if (merchantId) {
      return this.handleMerchantReview(userId, actualClientId, merchantId, orderId ?? undefined, rating, comment, tags);
    } else {
      throw new BadRequestException('Either expert_id or merchantId must be provided');
    }
  }

  private async handlePlatformReview(userId: string, rating: number, comment?: string, tags?: string[]) {
    const review = this.reviewRepository.create({
      client_id: userId as any,
      rating,
      comment,
      tags,
      review_type: 'platform',
      status: 'pending',
    });

    const savedReview = await this.reviewRepository.save(review);
    
    // Clean response for platform reviews
    const { 
      expert_id, merchant_id, order_id, session_id, call_session_id, 
      expert, merchant, order, session, callSession,
      ...cleanReview 
    } = savedReview as any;
    
    return cleanReview;
  }

  private async handleExpertReview(userId: string, clientId: string, expert_id: string, sessionId: string | undefined, rating: number, comment?: string, tags?: string[]) {
    const expert = await this.expertProfileFacade.getExpertById(expert_id) || await this.expertProfileFacade.getExpertByUserId(expert_id);
    if (!expert) throw new NotFoundException('Expert not found');
    
    // Ensure we use the actual primary ID for the rest of the logic
    const actualExpertId = expert.id;

    let chatSessionId: string | undefined = undefined;
    let callSessionId: string | undefined = undefined;

    if (sessionId) {
      // Check chat session first
      const chatSession = await this.chatSessionRepository.findOne({ where: { id: sessionId as any } });
      if (chatSession) {
        chatSessionId = sessionId;
        // Check for duplicate review
        const existingReview = await this.reviewRepository.findOne({ where: { session_id: sessionId as any } });
        if (existingReview) throw new BadRequestException('Session already reviewed');
      } else {
        // Try call session
        const callSession = await this.callSessionRepository.findOne({ where: { id: sessionId as any } });
        if (callSession) {
          callSessionId = sessionId;
          const existingReview = await this.reviewRepository.findOne({ where: { call_session_id: sessionId as any } });
          if (existingReview) throw new BadRequestException('Session already reviewed');
        }
      }
    }

    console.log('[CreateReview] Payload:', { userId, clientId, expert_id, sessionId, rating, comment, tags });

    const review = this.reviewRepository.create({
      client_id: clientId as any,
      expert: { id: actualExpertId } as any,
      session_id: chatSessionId ?? null,
      call_session_id: callSessionId ?? null,
      rating,
      comment,
      tags,
      review_type: 'expert',
    });

    console.log('[CreateReview] Review Object created:', review);

    try {
      const savedReview = await this.reviewRepository.save(review);
      console.log('[CreateReview] Review Saved:', savedReview.id);
      await this.updateExpertRating(actualExpertId);
      return savedReview;
    } catch (error) {
      console.error('[CreateReview] Error saving review:', error);
      throw error;
    }
  }

  private async handleMerchantReview(userId: string, clientId: string, merchantId: string, orderId: string | undefined, rating: number, comment?: string, tags?: string[]) {
    const merchant = await this.merchantProfileFacade.getProfileById(merchantId) || await this.merchantProfileFacade.getProfileByUserId(merchantId);
    if (!merchant) throw new NotFoundException('Merchant not found');
    
    const actualMerchantId = merchant.id;

    if (orderId) {
      const order = await this.orderFacade.getOrderById(orderId, userId);

      if (!order) throw new NotFoundException('Order not found');
      if (order.status !== 'delivered') {
        throw new BadRequestException('You can only review items from a delivered order');
      }

      // Verify order contains products from this merchant
      const hasMerchantProduct = order.items.some((item: any) => item.product?.merchant_id === merchant.user_id || item.product?.merchant_id === merchant.id);
      if (!hasMerchantProduct) {
        throw new ForbiddenException('This order does not contain products from this merchant');
      }

      // Prevent duplicate review for same order and merchant
      const existingReview = await this.reviewRepository.findOne({
        where: { order_id: orderId as any, merchant_id: actualMerchantId }
      });
      if (existingReview) throw new BadRequestException('You have already reviewed this merchant for this order');
    }

    const review = this.reviewRepository.create({
      client_id: clientId as any,
      merchant_id: actualMerchantId,
      order_id: orderId ?? null,
      rating,
      comment,
      tags,
      review_type: 'merchant',
    });

    const savedReview = await this.reviewRepository.save(review);
    await this.updateMerchantRating(actualMerchantId);
    return savedReview;
  }

  private async updateExpertRating(expert_id: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.expert_id = :expert_id', { expert_id })
      .getRawOne();

    const average = result?.average ? parseFloat(parseFloat(result.average).toFixed(1)) : 0;
    const count = result?.count ? parseInt(result.count, 10) : 0;

    await this.dataSource.createQueryBuilder().update('profile_expert').set({ rating: average, total_reviews: count }).where('id = :expert_id', { expert_id }).execute();
  }

  private async updateMerchantRating(merchantId: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.merchant_id = :merchantId', { merchantId })
      .getRawOne();

    const average = result?.average ? parseFloat(parseFloat(result.average).toFixed(1)) : 0;
    const count = result?.count ? parseInt(result.count, 10) : 0;

    await this.dataSource.createQueryBuilder().update('profile_merchant').set({ rating: average, reviewCount: count }).where('id = :merchantId', { merchantId }).execute();
  }
}
