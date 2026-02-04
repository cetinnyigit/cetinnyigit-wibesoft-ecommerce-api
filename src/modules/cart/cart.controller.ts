import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Session,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - insufficient stock' })
  async addItem(@Body() addToCartDto: AddToCartDto, @Session() session: any) {
    const sessionId = session.id || 'default-session';
    return await this.cartService.addItem(sessionId, addToCartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get cart contents' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@Session() session: any) {
    const sessionId = session.id || 'default-session';
    return await this.cartService.getCart(sessionId);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get cart items' })
  @ApiResponse({ status: 200, description: 'Cart items retrieved successfully' })
  async getCartItems(@Session() session: any) {
    const sessionId = session.id || 'default-session';
    return await this.cartService.getCartItems(sessionId);
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  async updateItem(
    @Param('productId') productId: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Session() session: any,
  ) {
    const sessionId = session.id || 'default-session';
    return await this.cartService.updateItem(sessionId, productId, updateCartItemDto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart successfully' })
  @ApiResponse({ status: 404, description: 'Item not found in cart' })
  async removeItem(@Param('productId') productId: number, @Session() session: any) {
    const sessionId = session.id || 'default-session';
    return await this.cartService.removeItem(sessionId, productId);
  }
}
