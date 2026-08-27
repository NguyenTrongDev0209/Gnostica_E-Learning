# Triển khai & DevOps - Gnostica E-Learning 🚀

> **Mục đích tài liệu:** Hướng dẫn chi tiết về triển khai (deployment), CI/CD pipeline, Docker containerization, Cloudflare Tunnel, và các quy trình vận hành. Dùng để AI hoàn thiện tài liệu triển khai và báo cáo.

---

## 1. Tổng quan Kiến trúc Triển khai

```
┌───────────────────────────────────────────────────────────────┐
│                    Internet                                   │
│                       │                                       │
│              ┌────────┴────────┐                              │
│              │  Cloudflare     │  DNS + CDN + DDoS Protection │
│              │  (gnostica.io.vn)│                              │
│              └────────┬────────┘                              │
│                       │                                       │
│              ┌────────┴────────┐                              │
│              │  Cloudflare     │  Zero-Trust Tunnel            │
│              │  Tunnel (Token) │  (không cần public IP)        │
│              └────────┬────────┘                              │
└───────────────────────┼───────────────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              │   Docker Host     │
              │                   │
              │  ┌─────────────┐  │
              │  │ cloudflared │  │  Tunnel agent
              │  └──────┬──────┘  │
              │         │         │
              │  ┌──────┼──────┐  │
              │  │      │      │  │
              │  │  ┌───┴───┐  │  │
              │  │  │ web   │  │  │  /*, Nginx:80
              │  │  │(React)│  │  │
              │  │  └───────┘  │  │
              │  │  ┌───────┐  │  │
              │  │  │server │  │  │  /api/*, /ws/*, Spring:8080
              │  │  │(Spring│  │  │
              │  │  └───┬───┘  │  │
              │  │      │      │  │
              │  │  ┌───┴───┐  │  │
              │  │  │postgres│ │  │  :5432 (internal)
              │  │  └───────┘  │  │
              │  └─────────────┘  │
              └───────────────────┘
```

---

## 2. Docker Containerization

### 2.1 Tổng quan Containers

| Container | Base Image | Port | Mô tả |
|-----------|-----------|------|-------|
| `gnostica-web` | `nginx:1.27-alpine` | 80 | React SPA (Vite build) |
| `gnostica-server` | `eclipse-temurin:17-jre-alpine` | 8080 | Spring Boot API |
| `gnostica-postgres` | `postgres:16-alpine` | 5432 (internal) / 5433 (host) | PostgreSQL database |
| `gnostica-cloudflared` | `cloudflare/cloudflared:latest` | — | Cloudflare Tunnel agent |

### 2.2 Docker Compose Production

**File**: `docker/docker-compose.production.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${PROD_DB_NAME}
      POSTGRES_USER: ${PROD_DB_USERNAME}
      POSTGRES_PASSWORD: ${PROD_DB_PASSWORD}
      TZ: Asia/Ho_Chi_Minh
    ports: ["127.0.0.1:5433:5432"]    # Chỉ bind localhost, không public
    volumes: [gnostica_postgres_data]
    healthcheck: pg_isready

  server:
    build: ../gnostica-server
    env_file: ../gnostica-server/.env
    environment:
      APP_ENV: production
      PAYOS_WEBHOOK_ENABLED: "true"
      DB_URL: jdbc:postgresql://postgres:5432/${PROD_DB_NAME}
    depends_on:
      postgres: { condition: service_healthy }

  web:
    build:
      context: ../gnostica-web
      args: { VITE_APP_ENV: production }
    healthcheck: wget http://127.0.0.1/health

  cloudflared:
    image: cloudflare/cloudflared:latest
    command: tunnel --no-autoupdate run --token ${CLOUDFLARE_TUNNEL_TOKEN}
    depends_on:
      web: { condition: service_healthy }
      server: { condition: service_started }
```

### 2.3 Dockerfile - Backend Server

**File**: `gnostica-server/Dockerfile`

```dockerfile
# Stage 1: Build (Multi-stage)
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:go-offline -B          # Cache dependencies
COPY src ./src
RUN mvn clean package -DskipTests -B      # Build WAR

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.war app.war
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.war"]
```

**Tối ưu:**
- Multi-stage build: Image runtime chỉ chứa JRE, không có Maven/JDK
- Layer caching: `pom.xml` copy riêng → `dependency:go-offline` chỉ chạy lại khi dependencies thay đổi
- Alpine base → image nhỏ gọn

### 2.4 Dockerfile - Web Frontend

**File**: `gnostica-web/Dockerfile`

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_APP_ENV=production
ENV VITE_APP_ENV=$VITE_APP_ENV
RUN npm run build

# Stage 2: Serve
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2.5 Nginx Configuration

**File**: `gnostica-web/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Block sensitive files
    location ~* /(?:\.env|\.git|\.svn|\.ht) { return 404; }
    location ~* \.(env|pem|key|sql|dump|sqlite)$ { return 404; }

    # SPA fallback
    location / { try_files $uri $uri/ /index.html; }

    # Health check
    location = /health { return 200 "ok"; }
}
```

---

## 3. Cloudflare Tunnel

### 3.1 Tổng quan
- **Mô hình**: Remotely managed tunnel (token-based)
- **Lợi ích**: Không cần public IP, tự động HTTPS, DDoS protection
- **Domain**: `gnostica.io.vn`

### 3.2 Routing Rules

**File**: `docker/cloudflared-ingress.yml.example`

| Hostname | Path | Service nội bộ | Mô tả |
|----------|------|----------------|-------|
| `gnostica.io.vn` | `^/api(?:/.*)?$` | `http://server:8080` | REST API |
| `gnostica.io.vn` | `^/ws(?:/.*)?$` | `http://server:8080` | WebSocket |
| `gnostica.io.vn` | `*` (default) | `http://web:80` | React SPA |

**Lưu ý**: Service names là Docker container names, KHÔNG dùng `localhost` (vì sẽ trỏ về cloudflared container).

### 3.3 Biến Môi trường

```env
CLOUDFLARE_TUNNEL_TOKEN=<token từ Cloudflare Zero Trust dashboard>
```

---

## 4. CI/CD Pipeline (GitHub Actions)

### 4.1 Workflow

**File**: `.github/workflows/ci.yml`

**Triggers:**
- `push` → branches `main`, `dev`
- `pull_request` → branch `main`
- `workflow_dispatch` (manual trigger)

**Steps:**

```
1. Checkout source code
2. Setup Java 17 (Temurin) + Maven cache
3. Build Spring Boot server (mvn package, skip tests)
4. Setup Node.js 22 + npm cache
5. Build React web (npm ci + npm run build)
6. Verify server Docker image builds
7. Verify web Docker image builds
```

### 4.2 Chi tiết

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      # Java
      - uses: actions/setup-java@v5
        with: { distribution: temurin, java-version: "17", cache: maven }
      - run: mvn --batch-mode -DskipTests package
        working-directory: gnostica-server

      # Node.js
      - uses: actions/setup-node@v6
        with: { node-version: "22", cache: npm }
      - run: npm ci && npm run build
        working-directory: gnostica-web

      # Docker
      - run: docker build --tag gnostica-server:ci ./gnostica-server
      - run: docker build --build-arg VITE_APP_ENV=production --tag gnostica-web:ci ./gnostica-web
```

### 4.3 Hiện trạng CI
- ✅ Build verification (compile + package)
- ✅ Docker image build verification
- ❌ Chưa có automated tests (`-DskipTests`)
- ❌ Chưa có automated deployment (CD)
- ❌ Chưa build/test mobile app

---

## 5. Biến Môi trường Production

### 5.1 Server (.env)

| Biến | Giá trị Production |
|------|-------------------|
| `APP_ENV` | `production` |
| `DB_URL` | `jdbc:postgresql://postgres:5432/<db_name>` |
| `PAYOS_WEBHOOK_ENABLED` | `true` |
| `APP_PUBLIC_URL` | `https://gnostica.io.vn` |
| Các biến khác | Xem `gnostica-server/.env.example` |

### 5.2 Web (.env)

```env
VITE_APP_ENV=production
```

### 5.3 Mobile (.env)

```env
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_OAUTH_REDIRECT_URI=gnostica://auth/callback
```

### 5.4 Docker Compose (.env)

```env
PROD_DB_NAME=gnostica-database
PROD_DB_USERNAME=<username>
PROD_DB_PASSWORD=<password>
APP_TIME_ZONE=Asia/Ho_Chi_Minh
CLOUDFLARE_TUNNEL_TOKEN=<token>
```

---

## 6. Logging & Monitoring

### 6.1 Docker Log Driver
```yaml
x-default-logging: &default-logging
  driver: local
  options:
    max-size: "10m"
    max-file: "3"
```

Tất cả containers sử dụng local log driver với rotation (max 30MB/container).

### 6.2 Application Logging
- Spring Boot: SLF4J + Logback
- Flyway: DEBUG level (migration tracking)
- SQL: Tắt mặc định (`APP_SQL_LOGGING_ENABLED=false`)

### 6.3 Audit Trail
- Bảng `Logs`: Ghi lại hành động người dùng (JSONB payload)
- Event-driven: `LogEvent` → `LogEventListener`

---

## 7. Quy trình Triển khai

### 7.1 Triển khai lần đầu

```bash
# 1. Clone repository
git clone <repository-url>
cd Gnostica_E-Learning

# 2. Cấu hình biến môi trường
cd gnostica-server
cp .env.example .env
# Edit .env: điền tất cả credentials

cd ../gnostica-web
cp .env.example .env
# Edit: VITE_APP_ENV=production

# 3. Cấu hình Docker Compose
cd ../docker
# Tạo .env: PROD_DB_NAME, PROD_DB_USERNAME, PROD_DB_PASSWORD, CLOUDFLARE_TUNNEL_TOKEN

# 4. Build & Start
docker compose -f docker-compose.production.yml up -d --build

# 5. Kiểm tra
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs -f server
```

### 7.2 Cập nhật (Re-deploy)

```bash
cd docker

# Pull code mới
git pull origin main

# Rebuild & restart
docker compose -f docker-compose.production.yml up -d --build

# Kiểm tra migration
docker compose -f docker-compose.production.yml logs server | grep -i flyway
```

### 7.3 Rollback

```bash
# Rollback web
docker compose -f docker-compose.production.yml up -d --build web

# Rollback server (cần cẩn thận với Flyway migration)
# Flyway không hỗ trợ rollback tự động, cần manual SQL
docker compose -f docker-compose.production.yml up -d --build server
```

---

## 8. Dịch vụ Cloud Bên ngoài

| Dịch vụ | Loại | Quản lý bởi |
|---------|------|-------------|
| **PostgreSQL** | Self-hosted (Docker) | Docker Compose |
| **Redis** | Cloud (Redis Labs) | redislabs.com |
| **MongoDB** | Cloud (Atlas) | mongodb.com |
| **Cloudinary** | Cloud | cloudinary.com |
| **Bunny.net** | Cloud (Stream + Storage) | bunny.net |
| **PayOS** | Cloud | payos.vn |
| **VNPay** | Cloud | vnpay.vn |
| **Gmail SMTP** | Cloud | Google |
| **OpenRouter** | Cloud | openrouter.ai |
| **Cloudflare** | Cloud (Tunnel + DNS) | cloudflare.com |

---

## 9. Bảo mật Production

### 9.1 Network
- PostgreSQL chỉ bind `127.0.0.1:5433` (không public)
- Tất cả traffic public qua Cloudflare Tunnel (HTTPS)
- Nginx block: `.env`, `.git`, `.sql`, `.pem`, `.key` files

### 9.2 Application
- JWT secret: dùng chuỗi ngẫu nhiên dài
- OAuth2 secrets: chỉ ở server-side `.env`
- Coupon codes: mã hóa AES (`CouponCodeCipher`)
- CORS: giới hạn origin patterns
- Webhook: verify checksum (PayOS)

### 9.3 Data
- Soft delete (không xóa cứng)
- Audit log (bảng `Logs`)
- Price snapshot (không đọc lại giá từ Course)
- Commission append-only
