# E-Commerce Backend API

WibeSoft Teknik Değerlendirme Görevi

## Özellikler

**Temel Gereksinimler:**
- Ürün yönetimi (CRUD)
- Sepet sistemi (session bazlı)
- Sipariş oluşturma

**Ekstra Yaptıklarım:**
- JWT authentication
- Swagger dokümantasyonu
- Docker Compose ile kolay kurulum
- Transaction yönetimi (sipariş için)
- Stok kontrolü

## Teknolojiler

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT & Passport
- Docker

## Kurulum

### Gereksinimler
- Node.js
- Docker
- npm

### Adımlar

1. **Paketleri yükle:**
```bash
npm install
```

2. **PostgreSQL'i başlat (Docker ile):**
```bash
docker-compose up -d
```

3. **Uygulamayı çalıştır:**
```bash
npm run start:dev
```

4. **Test verisi yükle (opsiyonel):**
```bash
npm run seed
```

Uygulama http://localhost:3000 adresinde çalışacak.

Swagger: http://localhost:3000/api/docs

## API Endpoints

### Products
- `GET /api/products` - Ürünleri listele
- `GET /api/products/:id` - Ürün detayı
- `POST /api/products` - Ürün oluştur (JWT gerekli)
- `PUT /api/products/:id` - Ürün güncelle (JWT gerekli)
- `DELETE /api/products/:id` - Ürün sil (JWT gerekli)

### Cart
- `POST /api/cart/items` - Sepete ekle
- `GET /api/cart` - Sepeti göster
- `PATCH /api/cart/items/:productId` - Miktar güncelle
- `DELETE /api/cart/items/:productId` - Sepetten çıkar

### Orders
- `POST /api/orders` - Sipariş oluştur
- `GET /api/orders` - Siparişleri listele
- `GET /api/orders/:id` - Sipariş detayı

### Auth
- `POST /api/auth/login` - Giriş yap
- `GET /api/auth/profile` - Profil (JWT gerekli)

## Test

Seed script ile test kullanıcısı ve ürünler oluşuyor:
- Username: `admin`
- Password: `password123`

Swagger'dan tüm endpoint'leri test edebilirsiniz.

## Proje Yapısı

```
src/
├── modules/
│   ├── products/   # Ürün modülü
│   ├── cart/       # Sepet modülü
│   ├── orders/     # Sipariş modülü
│   └── auth/       # Auth modülü
├── common/         # Ortak dosyalar (filters, interceptors)
└── config/         # Konfigürasyon
```

## Mimari Kararlar

- Sepet için session kullandım 
- Transaction ile sipariş oluşturma 
- Docker Compose ekledim 


## Docker Komutları

```bash
# PostgreSQL'i başlat
docker-compose up -d

# Logları gör
docker logs ecommerce_postgres

# Durdur
docker-compose down
```

## Geliştirici

Yiğit Çetin
