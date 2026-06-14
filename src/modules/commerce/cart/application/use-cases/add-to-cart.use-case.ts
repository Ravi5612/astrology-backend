import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../../infrastructure/entities/cart.entity';
import { CartItem } from '../../infrastructure/entities/cart-item.entity';
import { AddToCartDto } from '../../api/dto/create-cart.dto';
import { Product } from '../../../product/infrastructure/entities/product.entity';
import { ClientProfileFacade } from '@/modules/client/profile/application/profile.facade';
import { IUser } from '@/common/types/access-token.payload';

@Injectable()
export class AddToCartUseCase {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly clientFacade: ClientProfileFacade,
  ) {}

  async execute(user: IUser, addToCartDto: AddToCartDto) {
    const userId = user.id;
    const { productId, quantity } = addToCartDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let cart = await this.cartRepository.findOne({
      where: { client: { user: { id: userId } } },
      relations: ['items'],
    });

    if (!cart) {
      const client = await this.clientFacade.getProfile(user);
      if (!client) {
        throw new NotFoundException('Client profile not found');
      }
      cart = this.cartRepository.create({ client });
      await this.cartRepository.save(cart);
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    // Return the updated cart
    return this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items', 'items.product', 'client', 'client.user'],
    });
  }
}
