import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './modules/auth/auth.service';
import { ProductsService } from './modules/products/products.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const productsService = app.get(ProductsService);

  try {
    console.log('🌱 Starting database seeding...');

    // Create test user
    console.log('Creating test user...');
    await authService.createUser('admin', 'password123');
    console.log('✅ Test user created: username=admin, password=password123');

    // Create sample products
    console.log('Creating sample products...');
    
    const products = [
      {
        name: 'Laptop',
        description: 'High-performance laptop with 16GB RAM',
        price: 999.99,
        stock: 10,
        imageUrl: 'https://example.com/laptop.jpg',
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 29.99,
        stock: 50,
        imageUrl: 'https://example.com/mouse.jpg',
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with blue switches',
        price: 89.99,
        stock: 25,
        imageUrl: 'https://example.com/keyboard.jpg',
      },
      {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI and ethernet',
        price: 49.99,
        stock: 30,
        imageUrl: 'https://example.com/hub.jpg',
      },
      {
        name: 'Webcam HD',
        description: '1080p HD webcam with microphone',
        price: 69.99,
        stock: 15,
        imageUrl: 'https://example.com/webcam.jpg',
      },
    ];

    for (const product of products) {
      await productsService.create(product);
      console.log(`✅ Product created: ${product.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
  } finally {
    await app.close();
  }
}

seed();
