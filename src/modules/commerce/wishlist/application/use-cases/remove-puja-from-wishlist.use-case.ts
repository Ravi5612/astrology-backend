import { Injectable } from '@nestjs/common';
import { BooleanMessage } from '@/common/dto/boolean-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../../infrastructure/entities/wishlist.entity';
import {
  PujaNotInWishlistError,
  UserNotFoundError,
} from '../../domain/errors/wishlist.errors';
import { ClientProfileFacade } from '@/modules/client/profile/application/profile.facade';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class RemovePujaFromWishlistUseCase {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly clientProfileFacade: ClientProfileFacade,
  ) {}

  async execute(user: IUser, pujaId: string): Promise<BooleanMessage> {
    const client = await this.clientProfileFacade.getProfile(user);
    if (!client) {
      throw new UserNotFoundError();
    }

    const result = await this.wishlistRepository.delete({
      client: { id: client.id },
      puja: { id: pujaId },
    });

    if (result.affected === 0) {
      throw new PujaNotInWishlistError();
    }
    return new BooleanMessage();
  }
}
