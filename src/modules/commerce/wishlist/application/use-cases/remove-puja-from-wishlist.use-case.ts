
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../../infrastructure/entities/wishlist.entity';
import { PujaNotInWishlistError, UserNotFoundError } from '../../domain/errors/wishlist.errors';
import { ClientProfileFacade } from '@/modules/client/profile/application/profile.facade';

@Injectable()
export class RemovePujaFromWishlistUseCase {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly clientProfileFacade: ClientProfileFacade,
  ) {}

  async execute(userId: string, pujaId: string): Promise<void> {
    const client = await this.clientProfileFacade.getProfile(userId);
    if (!client) {
      throw new UserNotFoundError();
    }

    const wishlist = await this.wishlistRepository.findOne({
      where: { client: { id: client.id }, puja: { id: pujaId } },
    });

    if (!wishlist) {
      throw new PujaNotInWishlistError();
    }

    await this.wishlistRepository.remove(wishlist);
  }
}
