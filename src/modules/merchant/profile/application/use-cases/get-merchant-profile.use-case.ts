import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileMerchant } from '../../infrastructure/persistence/entities/profile-merchant.entity';

@Injectable()
export class GetMerchantProfileUseCase {
  constructor(
    @InjectRepository(ProfileMerchant)
    private readonly merchantRepository: Repository<ProfileMerchant>,
  ) {}

  async execute(userId: number) {
    const profile = await this.merchantRepository.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException('Merchant profile not found');
    }

    return {
      success: true,
      data: {
        id: profile.id,
        name: profile.shopName || profile.user?.name,
        managerName: profile.managerName,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        pincode: profile.pincode,
        image: profile.user?.avatar,
        video: profile.video,
        status: profile.status,
        kycStatus: profile.kycStatus,
      },
    };
  }
}
