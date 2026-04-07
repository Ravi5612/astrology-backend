import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileMerchant } from '../../infrastructure/persistence/entities/profile-merchant.entity';

@Injectable()
export class GetMerchantDetailsUseCase {
  constructor(
    @InjectRepository(ProfileMerchant)
    private readonly merchantRepository: Repository<ProfileMerchant>,
  ) {}

  async execute(id: number) {
    const merchant = await this.merchantRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!merchant) {
      throw new NotFoundException({
        success: false,
        message: 'Store not found',
        error: 'ERR_NOT_FOUND',
      });
    }

    return {
      success: true,
      data: {
        id: merchant.id,
        name: merchant.shopName || merchant.user?.name,
        image: merchant.user?.avatar,
        address: merchant.address,
        city: merchant.city,
        pincode: merchant.pincode,
        phone: merchant.phone || merchant.user?.email, // Fallback to email if phone is not available
        email: merchant.user?.email,
        rating: merchant.rating,
        reviewCount: merchant.reviewCount,
        established: merchant.established,
        description: merchant.description,
        isTrusted: merchant.isTrusted,
        gallery: merchant.gallery || [],
        features: merchant.features || [],
      },
    };
  }
}
