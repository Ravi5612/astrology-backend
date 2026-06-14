import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WishlistFacade } from '../../application/wishlist.facade';
import { AddExpertToWishlistDto } from '../dto/add-expert-wishlist.dto';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IUser } from '@/common/types/access-token.payload';

@Controller({
  path: 'expert-like',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class ExpertLikeController {
  constructor(private readonly wishlistFacade: WishlistFacade) {}

  @Get()
  findAllExperts(@CurrentUser() user: IUser) {
    return this.wishlistFacade.getExpertWishlist(user.id);
  }

  @Post('add')
  createExpert(
    @CurrentUser() user: IUser,
    @Body() addExpertToWishlistDto: AddExpertToWishlistDto,
  ) {
    return this.wishlistFacade.addExpertToWishlist(
      user,
      addExpertToWishlistDto.expert_id,
    );
  }

  @Delete('remove/:expert_id')
  async removeExpert(
    @CurrentUser() user: IUser,
    @Param('expert_id') expert_id: string,
  ) {
    const _result = await this.wishlistFacade.removeExpertFromWishlist(
      user,
      expert_id,
    );
    return { success: true };
  }
}
