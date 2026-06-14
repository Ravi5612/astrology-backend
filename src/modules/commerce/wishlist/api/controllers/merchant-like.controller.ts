import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { WishlistFacade } from '../../application/wishlist.facade';
import { AddMerchantWishlistDto } from '../dto/add-merchant-wishlist.dto';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IUser } from '@/common/types/access-token.payload';

@Controller({
  path: 'merchant-like',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class MerchantLikeController {
  constructor(private readonly wishlistFacade: WishlistFacade) {}

  @Get()
  findAll(@CurrentUser() user: IUser) {
    return this.wishlistFacade.getMerchantWishlist(user.id);
  }

  @Post('add')
  create(
    @CurrentUser() user: IUser,
    @Body() dto: AddMerchantWishlistDto,
  ) {
    return this.wishlistFacade.addMerchantToWishlist(user, dto.merchantId);
  }

  @Delete('remove/:merchantId')
  async remove(
    @CurrentUser() user: IUser,
    @Param('merchantId', ParseUUIDPipe) merchantId: string,
  ) {
    const _result = await this.wishlistFacade.removeMerchantFromWishlist(
      user,
      merchantId,
    );
    return { success: true };
  }
}
