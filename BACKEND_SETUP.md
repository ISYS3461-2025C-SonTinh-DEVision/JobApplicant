# Backend Setup Guide

## Yêu cầu hệ thống

- **Java 21** hoặc cao hơn
- **MongoDB** (local hoặc Atlas)
- **Redis** (cho token blacklist và rate limiting)

## Bước 1: Cấu hình môi trường

Tạo file `.env` trong thư mục `JobApplicant-BE/backend/`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/JA-DB
# Hoặc sử dụng MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/JA-DB

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Frontend URL (cho CORS và email links)
FRONTEND_BASE_URL=http://localhost:3000

# Email (sử dụng Resend hoặc SMTP khác)
MAIL_USERNAME=resend
MAIL_PASSWORD=re_your_api_key_here
MAIL_FROM=onboarding@resend.dev

# Cloudinary (cho upload files)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Bước 2: Chạy MongoDB (local)

### macOS (Homebrew):
```bash
brew services start mongodb-community
```

### Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Bước 3: Chạy Redis (local)

### macOS (Homebrew):
```bash
brew services start redis
```

### Docker:
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

## Bước 4: Chạy Backend

```bash
cd /Users/crystal/ASM2/JobApplicant-BE/backend

# Build và chạy
./mvnw spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

## Bước 5: Kiểm tra

- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/v3/api-docs

## API Endpoints chính

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/check-session` - Kiểm tra session
- `GET /api/auth/activate?token=xxx` - Kích hoạt tài khoản
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Countries
- `GET /api/countries` - Danh sách quốc gia cho dropdown

## Lưu ý

1. **Email Activation**: Backend yêu cầu kích hoạt email trước khi login
2. **JWT Tokens**: Sử dụng HTTP-only cookies cho bảo mật
3. **Rate Limiting**: Block login sau 5 lần thất bại trong 60 giây
4. **CORS**: Đã cấu hình cho `http://localhost:3000`

## Troubleshooting

### Lỗi kết nối MongoDB
```
Error: MongoSocketOpenException
```
→ Kiểm tra MongoDB đang chạy: `mongosh` hoặc `brew services list`

### Lỗi kết nối Redis
```
Error: Could not get a resource from the pool
```
→ Kiểm tra Redis: `redis-cli ping` (trả về PONG là OK)

### Lỗi gửi email
→ Backend vẫn hoạt động nhưng không gửi được email activation
→ Kiểm tra cấu hình MAIL_* trong .env

