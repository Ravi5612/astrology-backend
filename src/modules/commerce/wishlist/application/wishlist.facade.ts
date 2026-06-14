import { Injectable } from '@nestjs/common';
import { AddProductToWishlistUseCase } from './use-cases/add-product-to-wishlist.use-case';
import { RemoveProductFromWishlistUseCase } from './use-cases/remove-product-from-wishlist.use-case';
import { GetProductWishlistUseCase } from './use-cases/get-product-wishlist.use-case';
import { AddExpertToWishlistUseCase } from './use-cases/add-expert-to-wishlist.use-case';
import { RemoveExpertFromWishlistUseCase } from './use-cases/remove-expert-from-wishlist.use-case';
import { GetExpertWishlistUseCase } from './use-cases/get-expert-wishlist.use-case';
import { AddPujaToWishlistUseCase } from './use-cases/add-puja-to-wishlist.use-case';
import { RemovePujaFromWishlistUseCase } from './use-cases/remove-puja-from-wishlist.use-case';
import { GetPujaWishlistUseCase } from './use-cases/get-puja-wishlist.use-case';
import { AddMerchantToWishlistUseCase } from './use-cases/add-merchant-to-wishlist.use-case';
import { RemoveMerchantFromWishlistUseCase } from './use-cases/remove-merchant-from-wishlist.use-case';
import { GetMerchantWishlistUseCase } from './use-cases/get-merchant-wishlist.use-case';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class WishlistFacade {
  constructor(
    private readonly addProductUseCase: AddProductToWishlistUseCase,
    private readonly removeProductUseCase: RemoveProductFromWishlistUseCase,
    private readonly getProductWishlistUseCase: GetProductWishlistUseCase,
    private readonly addExpertUseCase: AddExpertToWishlistUseCase,
    private readonly removeExpertUseCase: RemoveExpertFromWishlistUseCase,
    private readonly getExpertWishlistUseCase: GetExpertWishlistUseCase,
    private readonly addPujaUseCase: AddPujaToWishlistUseCase,
    private readonly removePujaUseCase: RemovePujaFromWishlistUseCase,
    private readonly getPujaWishlistUseCase: GetPujaWishlistUseCase,
    private readonly addMerchantUseCase: AddMerchantToWishlistUseCase,
    private readonly removeMerchantUseCase: RemoveMerchantFromWishlistUseCase,
    private readonly getMerchantWishlistUseCase: GetMerchantWishlistUseCase,
  ) {}

  async getProductWishlist(userId: string) {
    return this.getProductWishlistUseCase.execute(userId);
  }

  async addProductToWishlist(user: IUser, productId: string) {
    return this.addProductUseCase.execute(user, productId);
  }

  async removeProductFromWishlist(user: IUser, productId: string) {
    return this.removeProductUseCase.execute(user, productId);
  }

  async getExpertWishlist(userId: string) {
    return this.getExpertWishlistUseCase.execute(userId);
  }

  async addExpertToWishlist(user: IUser, expert_id: string) {
    return this.addExpertUseCase.execute(user, expert_id);
  }

  async removeExpertFromWishlist(user: IUser, expert_id: string) {
    return this.removeExpertUseCase.execute(user, expert_id);
  }

  async getPujaWishlist(userId: string) {
    return this.getPujaWishlistUseCase.execute(userId);
  }

  async addPujaToWishlist(user: IUser, pujaId: string) {
    return this.addPujaUseCase.execute(user, pujaId);
  }

  async removePujaFromWishlist(user: IUser, pujaId: string) {
    return this.removePujaUseCase.execute(user, pujaId);
  }

  async getMerchantWishlist(userId: string) {
    return this.getMerchantWishlistUseCase.execute(userId);
  }

  async addMerchantToWishlist(user: IUser, merchantId: string) {
    return this.addMerchantUseCase.execute(user, merchantId);
  }

  async removeMerchantFromWishlist(user: IUser, merchantId: string) {
    return this.removeMerchantUseCase.execute(user, merchantId);
  }
}
