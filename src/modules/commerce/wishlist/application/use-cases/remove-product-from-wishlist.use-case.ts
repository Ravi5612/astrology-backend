
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../../infrastructure/entities/wishlist.entity';
import { ProductNotInWishlistError, UserNotFoundError } from '../../domain/errors/wishlist.errors';
import { ClientProfileFacade } from '@/modules/client/profile/application/profile.facade';

@Injectable()
export class RemoveProductFromWishlistUseCase {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly clientProfileFacade: ClientProfileFacade,
  ) {}

  async execute(userId: string, productId: string): Promise<{ message: string }> {
    const client = await this.clientProfileFacade.getProfile(userId);
    if (!client) {
      throw new UserNotFoundError();
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: { client: { id: client.id }, product: { id: productId } },
    });

    if (!wishlist) {
      throw new ProductNotInWishlistError();
    }

    await this.wishlistRepository.remove(wishlist);
    return { message: 'Product removed from wishlist' };
  }
}
