import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async getOrCreateCart(sessionId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId: sessionId },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      this.logger.log(`Creating new cart for session: ${sessionId}`);
      cart = this.cartRepository.create({ userId: sessionId });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addItem(sessionId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    this.logger.log(`Adding item to cart for session: ${sessionId}`);
    
    // Önce ürünün var olup olmadığını ve stok kontrolü yapıyorum
    const product = await this.productsService.findOne(addToCartDto.productId);
    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}, Requested: ${addToCartDto.quantity}`,
      );
    }

    const cart = await this.getOrCreateCart(sessionId);

    // Check if item already exists in cart
    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId: addToCartDto.productId,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Total requested: ${newQuantity}`,
        );
      }
      existingItem.quantity = newQuantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      // Create new cart item
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: addToCartDto.productId,
        quantity: addToCartDto.quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return await this.getCart(sessionId);
  }

  async getCart(sessionId: string): Promise<Cart> {
    this.logger.log(`Fetching cart for session: ${sessionId}`);
    const cart = await this.getOrCreateCart(sessionId);
    
    // Calculate total price
    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    return {
      ...cart,
      totalPrice,
    } as any;
  }

  async updateItem(
    sessionId: string,
    productId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    this.logger.log(`Updating cart item for session: ${sessionId}`);
    
    const cart = await this.getOrCreateCart(sessionId);
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId,
      },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    // Check stock
    if (cartItem.product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${cartItem.product.stock}, Requested: ${updateCartItemDto.quantity}`,
      );
    }

    cartItem.quantity = updateCartItemDto.quantity;
    await this.cartItemRepository.save(cartItem);

    return await this.getCart(sessionId);
  }

  async removeItem(sessionId: string, productId: string): Promise<Cart> {
    this.logger.log(`Removing item from cart for session: ${sessionId}`);
    
    const cart = await this.getOrCreateCart(sessionId);
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.cartItemRepository.remove(cartItem);
    return await this.getCart(sessionId);
  }

  async clearCart(sessionId: string): Promise<void> {
    this.logger.log(`Clearing cart for session: ${sessionId}`);
    const cart = await this.getOrCreateCart(sessionId);
    await this.cartItemRepository.delete({ cartId: cart.id });
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    this.logger.log(`Fetching cart items for session: ${sessionId}`);
    const cart = await this.getOrCreateCart(sessionId);
    return cart.items;
  }
}
