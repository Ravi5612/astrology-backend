import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ProfileMerchant, MerchantStatus } from '../../infrastructure/persistence/entities/profile-merchant.entity';

@Injectable()
export class GetAllMerchantsUseCase {
  constructor(
    @InjectRepository(ProfileMerchant)
    private readonly merchantRepository: Repository<ProfileMerchant>,
  ) {}

  async execute(filters: { search?: string; city?: string; page?: number; limit?: number } = {}) {
    const { search, city, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const query = this.merchantRepository.createQueryBuilder('merchant')
      .leftJoinAndSelect('merchant.user', 'user')
      .where('merchant.status = :status', { status: MerchantStatus.ACTIVE });

    if (city) {
      query.andWhere('merchant.city ILIKE :city', { city: `%${city}%` });
    }

    if (search) {
      query.andWhere(
        '(merchant.shopName ILIKE :search OR merchant.address ILIKE :search OR merchant.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [merchants, total] = await query
      .orderBy('merchant.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const formattedMerchants = merchants.map((m) => ({
      id: m.id,
      name: m.shopName || m.user?.name,
      image: m.user?.avatar,
      city: m.city,
      rating: m.rating,
      reviewCount: m.reviewCount,
      isTrusted: m.isTrusted,
    }));

    return {
      success: true,
      data: formattedMerchants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
