import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly cartService: CartService,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  async createFromCart(sessionId: string, createOrderDto?: CreateOrderDto): Promise<Order> {
    this.logger.log(`Creating order from cart for session: ${sessionId}`);

    const cart = await this.cartService.getCart(sessionId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Transaction kullanıyorum çünkü sipariş oluştururken birden fazla tablo güncellemem gerekiyor
    // Eğer bir hata olursa hepsini geri almam lazım
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate total amount
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of cart.items) {
        const product = cartItem.product;
        
        // Check stock availability
        if (product.stock < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`,
          );
        }

        // Decrease product stock
        await this.productsService.decreaseStock(product.id, cartItem.quantity);

        // Calculate item total
        const itemTotal = Number(product.price) * cartItem.quantity;
        totalAmount += itemTotal;

        // Create order item (will be saved later)
        const orderItem = this.orderItemRepository.create({
          productId: product.id,
          quantity: cartItem.quantity,
          priceAtOrder: product.price,
        });
        orderItems.push(orderItem);
      }

      // Create order
      const order = this.orderRepository.create({
        userId: createOrderDto?.userId || sessionId,
        totalAmount,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Save order items with order reference
      for (const orderItem of orderItems) {
        orderItem.orderId = savedOrder.id;
        await queryRunner.manager.save(orderItem);
      }

      // Clear cart
      await this.cartService.clearCart(sessionId);

      // Commit transaction
      await queryRunner.commitTransaction();

      this.logger.log(`Order created successfully: ${savedOrder.id}`);

      // Return order with items
      return await this.findOne(savedOrder.id);
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAll(): Promise<{ data: Order[] }> {
    this.logger.log('Fetching all orders');
    const orders = await this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
    return { data: orders };
  }

  async findOne(id: number): Promise<Order> {
    this.logger.log(`Fetching order with id: ${id}`);
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }
}
