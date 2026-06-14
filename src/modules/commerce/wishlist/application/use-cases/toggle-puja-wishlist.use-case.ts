import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../../infrastructure/entities/wishlist.entity';
import { ClientProfileFacade } from '@/modules/client/profile/application/profile.facade';
import { ExpertProfileFacade } from '@/modules/expert/profile/application/profile.facade';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class TogglePujaWishlistUseCase {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly expertProfileFacade: ExpertProfileFacade,
    private readonly clientProfileFacade: ClientProfileFacade,
  ) {}

  async execute(
    user: IUser,
    pujaId: string,
  ): Promise<{ liked: boolean; total_likes: number }> {
    const client = await this.clientProfileFacade.getProfile(user);
    if (!client) throw new NotFoundException('Client profile not found');

    const puja = await this.expertProfileFacade.getPujaById(pujaId);
    if (!puja) throw new NotFoundException('Puja not found');

    const existing = await this.wishlistRepository.findOne({
      where: { client: { id: client.id }, puja: { id: pujaId } },
    });

    let liked = false;
    let currentTotalLikes = puja.total_likes || 0;

    if (existing) {
      await this.wishlistRepository.remove(existing);
      await this.expertProfileFacade.updatePujaLikes(pujaId, -1);
      currentTotalLikes = Math.max(0, currentTotalLikes - 1);
      liked = false;
    } else {
      const wishlist = this.wishlistRepository.create({ client, puja });
      await this.wishlistRepository.save(wishlist);
      await this.expertProfileFacade.updatePujaLikes(pujaId, 1);
      currentTotalLikes = currentTotalLikes + 1;
      liked = true;
    }

    return { liked, total_likes: currentTotalLikes };
  }
}
