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
import { AddPujaToWishlistDto } from '../dto/add-puja-wishlist.dto';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IUser } from '@/common/types/access-token.payload';

@Controller({
  path: 'puja-like',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class PujaLikeController {
  constructor(private readonly wishlistFacade: WishlistFacade) {}

  @Get()
  findAllPujas(@CurrentUser() user: IUser) {
    return this.wishlistFacade.getPujaWishlist(user.id);
  }

  @Post('add')
  createPuja(
    @CurrentUser() user: IUser,
    @Body() addPujaToWishlistDto: AddPujaToWishlistDto,
  ) {
    return this.wishlistFacade.addPujaToWishlist(
      user,
      addPujaToWishlistDto.pujaId,
    );
  }

  @Delete('remove/:pujaId')
  async removePuja(
    @CurrentUser() user: IUser,
    @Param('pujaId') pujaId: string,
  ) {
    const _result = await this.wishlistFacade.removePujaFromWishlist(
      user,
      pujaId,
    );
    return { success: true };
  }
}
