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

@Controller({
  path: 'product-like',
  version: '1',
})
@UseGuards(JwtAuthGuard)
export class ProductLikeController {
  constructor(private readonly wishlistFacade: WishlistFacade) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.wishlistFacade.getProductWishlist(userId);
  }

  @Post('add')
  create(
    @CurrentUser('id') userId: string,
    @Body() createWishlistDto: CreateWishlistDto,
  ) {
    return this.wishlistFacade.addProductToWishlist(
      userId,
      createWishlistDto.productId,
    );
  }

  @Delete('remove/:productId')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    const _result = await this.wishlistFacade.removeProductFromWishlist(
      userId,
      productId,
    );
    return { success: true };
  }
}
