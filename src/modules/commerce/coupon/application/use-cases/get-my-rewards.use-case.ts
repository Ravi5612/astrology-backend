
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCoupon } from '../../infrastructure/entities/user-coupon.entity';
import { ClientProfileFacade } from '@/modules/client/profile/application/profile.facade';

@Injectable()
export class GetMyRewardsUseCase {
    constructor(
        @InjectRepository(UserCoupon)
        private readonly userCouponRepo: Repository<UserCoupon>,
        private readonly clientProfileFacade: ClientProfileFacade,
    ) { }

    async execute(userId: string) {
        const client = await this.clientProfileFacade.getProfile(userId);
        if (!client) {
            return [];
        }

        return this.userCouponRepo.find({
            where: { client_id: client.id },
            relations: ['coupon'],
            order: { assigned_at: 'DESC' },
        });
    }
}
