# 📋 IELTS Mate Frontend - Hướng dẫn Cài đặt

Hướng dẫn chi tiết để cài đặt và chạy ứng dụng IELTS Mate Frontend trên môi trường phát triển và production.

---

## 📋 Mục lục

- [Điều kiện tiên quyết](#điều-kiện-tiên-quyết)
- [Cài đặt cơ bản](#cài-đặt-cơ-bản)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Scripts phát triển](#scripts-phát-triển)
- [Triển khai với Docker](#triển-khai-với-docker)
- [Công cụ phát triển](#công-cụ-phát-triển)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Điều kiện tiên quyết

### Phần mềm bắt buộc

| Công cụ | Phiên bản tối thiểu | Phiên bản khuyến nghị | Mục đích |
|---------|-------------------|---------------------|----------|
| **Node.js** | 18.x | 22.14.x | Runtime JavaScript |
| **Yarn** | 1.22.x | 1.22.22 | Package manager |
| **Git** | 2.x | Latest | Version control |

### Phần mềm tùy chọn

| Công cụ | Mục đích |
|---------|----------|
| **Docker** | Containerization và deployment |
| **Docker Compose** | Multi-container orchestration |
| **VS Code** | IDE khuyến nghị với extensions |

### Kiểm tra điều kiện tiên quyết

```bash
# Kiểm tra Node.js
node --version
# Kết quả mong đợi: v22.14.x hoặc cao hơn

# Kiểm tra Yarn
yarn --version
# Kết quả mong đợi: 1.22.22

# Kiểm tra Git
git --version
# Kết quả mong đợi: git version 2.x.x

# Kiểm tra Docker (tùy chọn)
docker --version
docker-compose --version
```

---

## 🚀 Cài đặt cơ bản

### 1. Clone repository

```bash
# Clone từ repository
git clone <repository-url>
cd ielts-mate-fe

# Kiểm tra branch hiện tại
git branch
```

### 2. Cài đặt dependencies

```bash
# Kích hoạt Corepack (cho Yarn modern)
corepack enable

# Cài đặt tất cả dependencies
yarn install

# Xác nhận cài đặt thành công
yarn check
```

### 3. Cấu hình ban đầu

```bash
# Cài đặt Husky cho Git hooks
yarn prepare

# Kiểm tra cấu hình TypeScript
yarn type

# Kiểm tra code quality
yarn check
```

---

## ⚙️ Cấu hình môi trường

### File môi trường

Tạo các file môi trường cần thiết:

```bash
# Môi trường development
cp .env.example .env.local

# Môi trường staging (tùy chọn)
cp .env.example .env.staging

# Môi trường production (tùy chọn)
cp .env.example .env.production
```

### Biến môi trường quan trọng

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Database (nếu cần)
DATABASE_URL=postgresql://user:password@localhost:5432/ielts_mate

# Authentication (nếu có)
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (nếu có)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 🛠️ Scripts phát triển

### Scripts cơ bản

```bash
# Chạy ứng dụng ở chế độ development
yarn dev

# Chạy với Turbo mode (nhanh hơn)
yarn dev

# Chạy với staging environment
yarn dev:staging

# Build ứng dụng cho production
yarn build

# Chạy ứng dụng production
yarn start
```

### Scripts code quality

```bash
# Kiểm tra TypeScript
yarn type

# Lint code với Biome
yarn check

# Format code
yarn format

# Sửa tự động các lỗi lint và format
yarn fix

# Chỉ sửa linting issues
yarn fix:lint

# Chỉ format code
yarn fix:format
```

### Scripts testing

```bash
# Chạy Cypress E2E tests
yarn test:e2e

# Mở Cypress Test Runner
yarn cypress
```

---

## 🐳 Triển khai với Docker

### Sử dụng Makefile (khuyến nghị)

```bash
# Xem tất cả commands có sẵn
make help

# Build và chạy ứng dụng
make all

# Hoặc từng bước riêng biệt:
make build    # Build Docker image
make run      # Chạy container
make logs     # Xem logs
make status   # Kiểm tra trạng thái

# Quản lý container
make stop     # Dừng container
make restart  # Restart container
make clean    # Xóa container và image
```

### Sử dụng Docker commands trực tiếp

```bash
# Build image
docker build -t ielts-mate-fe .

# Chạy container
docker run -d --name ielts-mate-app -p 3000:3000 ielts-mate-fe

# Kiểm tra logs
docker logs -f ielts-mate-app

# Dừng và xóa
docker stop ielts-mate-app
docker rm ielts-mate-app
```

### Docker Compose (tùy chọn)

Tạo file `docker-compose.yml`:

```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

```bash
# Chạy với Docker Compose
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

---

## 🔨 Công cụ phát triển

### VS Code Extensions khuyến nghị

```json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "cypress-io.cypress-extension-pack"
  ]
}
```

### ShadcnUI Components

```bash
# Thêm component mới từ ShadcnUI
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form

# Cập nhật tất cả components
npx shadcn@latest update
```

### Git Hooks

Project đã cấu hình sẵn Git hooks với Husky:

- **pre-commit**: Chạy lint-staged (format và lint code)
- **commit-msg**: Kiểm tra commit message format với commitlint

```bash
# Commit message format (Conventional Commits)
feat: add new reading practice component
fix: resolve audio player issue
docs: update installation guide
```

---

## 🎯 Kiểm tra cài đặt

### 1. Khởi động development server

```bash
yarn dev
```

Truy cập: http://localhost:3000

### 2. Kiểm tra build production

```bash
yarn build
yarn start
```

### 3. Chạy tests

```bash
# E2E tests
yarn test:e2e

# Code quality checks
yarn check
yarn type
```

---

## ❗ Troubleshooting

### Lỗi thường gặp

#### 1. Node.js version không tương thích

```bash
# Cài đặt Node.js 22.14 hoặc sử dụng nvm
nvm install 22.14
nvm use 22.14
```

#### 2. Yarn không được cài đặt

```bash
# Cài đặt Yarn globally
npm install -g yarn

# Hoặc sử dụng Corepack
corepack enable
```

#### 3. Dependencies conflict

```bash
# Xóa node_modules và reinstall
rm -rf node_modules
rm yarn.lock
yarn install
```

#### 4. Docker build fails

```bash
# Clear Docker cache
docker builder prune

# Build lại từ đầu
docker build --no-cache -t ielts-mate-fe .
```

#### 5. Port 3000 đã được sử dụng

```bash
# Tìm và kill process đang sử dụng port 3000
lsof -ti:3000 | xargs kill -9

# Hoặc sử dụng port khác
PORT=3001 yarn dev
```

### Logs và debugging

```bash
# Xem logs chi tiết
DEBUG=* yarn dev

# Kiểm tra build output
yarn build --debug

# Docker logs
docker logs ielts-mate-app --follow
```

---

## 📞 Hỗ trợ

- **Documentation**: Xem thêm tại `/docs` folder
- **Issues**: Tạo issue trên repository GitHub
- **Conventions**: Đọc `CONTRIBUTING.md` trước khi contribute

---

## 📈 Next Steps

Sau khi cài đặt thành công:

1. 📖 Đọc `README.md` để hiểu architecture
2. 🎨 Xem `DESIGN_SYSTEM.md` để biết về UI guidelines
3. 🔧 Cấu hình IDE theo khuyến nghị
4. 🧪 Chạy test suite đầy đủ
5. 🚀 Bắt đầu development!

---

**Chúc bạn coding vui vẻ! 🎉**