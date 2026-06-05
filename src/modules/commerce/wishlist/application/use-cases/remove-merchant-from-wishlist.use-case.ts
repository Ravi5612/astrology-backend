
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../../infrastructure/entities/wishlist.entity';
import { MerchantNotInWishlistError, UserNotFoundError } from '../../domain/errors/wishlist.errors';
import { ClientProfileFacade } from '@/modules/client/profile/application/profile.facade';

@Injectable()
export class RemoveMerchantFromWishlistUseCase {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly clientProfileFacade: ClientProfileFacade,
  ) {}

  async execute(userId: string, merchantId: string): Promise<void> {
    const client = await this.clientProfileFacade.getProfile(userId);
    if (!client) {
      throw new UserNotFoundError();
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: { client: { id: client.id }, merchant: { id: merchantId } },
    });

    if (!wishlist) {
      throw new MerchantNotInWishlistError();
    }

    await this.wishlistRepository.delete(wishlist.id);
  }
}
