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
import { CreateWishlistDto } from '../dto/create-wishlist.dto';
import { JwtAuthGuard } from '@/modules/auth/api/guards/auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { IUser } from '@/common/types/access-token.payload';

@Controller({
  path: 'product-like',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class ProductLikeController {
  constructor(private readonly wishlistFacade: WishlistFacade) {}

  @Get()
  findAll(@CurrentUser() user: IUser) {
    return this.wishlistFacade.getProductWishlist(user.id);
  }

  @Post('add')
  create(
    @CurrentUser() user: IUser,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    return this.wishlistFacade.addProductToWishlist(
      user,
      createWishlistDto.productId,
    );
  }

  @Delete('remove/:productId')
  async remove(
    @CurrentUser() user: IUser,
    @Param('productId') productId: string,
  ) {
    const _result = await this.wishlistFacade.removeProductFromWishlist(
      user,
      productId,
    );
    return { success: true };
  }
}
