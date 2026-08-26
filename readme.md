# Ecommerce Platform

Website thương mại điện tử (tiếng Việt) gồm 3 dự án độc lập chạy cùng nhau:

| Thư mục       | Vai trò                                                                        | Công nghệ chính                                                                       |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| `backend/`    | REST API nghiệp vụ chính (auth, sản phẩm, đơn hàng, thanh toán, vận chuyển...) | Node.js, Express 5, Prisma ORM, MySQL                                                 |
| `frontend/`   | Web app cho khách hàng (client) và trang quản trị (admin)                      | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, Zustand, React Router v7 |
| `strapi-cms/` | CMS phụ trợ, quản lý nội dung tĩnh cho các trang marketing                     | Strapi 5                                                                              |

---

## 1. Tổng quan kiến trúc

```
┌───────────────────┐        ┌─────────────────────┐
│   frontend/       │  REST  │   backend/          │
│   (React SPA)     │◄──────►│   (Express API)     │
│   client + admin  │        │   Prisma + MySQL    │
└─────────┬─────────┘        └──────────┬──────────┘
          │  REST (nội dung tĩnh)       │
          ▼                             │ tích hợp ngoài
┌──────────────────┐                    ▼
│   strapi-cms/    │        ┌──────────────────────────────┐
│   (nội dung CMS) │        │  GHN, Google/Facebook OAuth, │
└──────────────────┘        │  VNPay, ZaloPay, SMTP        │
                            └──────────────────────────────┘
```

Sơ đồ kiến trúc tổng thể
![Sơ đồ kiến trúc tổng thể](docs/images/project-structure/architecture.svg)

- **`frontend`** gọi hai API độc lập song song:
  - `apiClient` (axios, `withCredentials: true`) → `backend` cho toàn bộ nghiệp vụ (auth, giỏ hàng, đơn hàng...), có interceptor tự động refresh access token khi gặp `401`.
  - `strapiClient` (axios riêng biệt) → `strapi-cms` chỉ để lấy nội dung các trang tĩnh (Home, About, Contact, Shop banner).
- **`backend`** là nguồn sự thật duy nhất cho dữ liệu giao dịch (user, sản phẩm, đơn hàng, thanh toán...) và tự tích hợp trực tiếp với các dịch vụ bên thứ ba (GHN, cổng thanh toán, OAuth, SMTP) — `strapi-cms` không liên quan tới các luồng này.

---

## 2. Backend (`backend/`)

### 2.1. Công nghệ

- **Runtime**: Node.js (ESM, `type: module`), viết bằng TypeScript, chạy dev qua `tsx watch`.
- **Framework**: Express 5.
- **ORM**: Prisma 7 (adapter MariaDB) trên **MySQL**.
- **Xác thực**: JWT (access token + refresh token riêng biệt), cookie `httpOnly`, `bcrypt` để hash mật khẩu.
- **OAuth**: Google (`google-auth-library`, xác thực idToken) và Facebook (Graph API `debug_token`).
- **Validation**: Zod cho toàn bộ input (body/query/param) thông qua middleware `validate`.
- **Khác**: `helmet` (bảo mật header), `cors`, `morgan` (logging), `multer` (upload ảnh), `@getbrevo/brevo` (gửi email OTP qua HTTPS API), `node-cron` (job nền).

### 2.2. Kiến trúc thư mục — modular theo feature

```
backend/src/
├── app.ts                      # Khởi tạo Express app, mount toàn bộ router
├── server.ts                   # Bootstrap: kết nối DB, seed dữ liệu, start server, graceful shutdown
├── config/                     # env (zod-validated), Prisma client, axios instance, SMTP
├── middlewares/                # authenticateJWT, requirePermission (RBAC), validate (Zod)
├── cronjob/                    # Job dọn đơn "pending" quá hạn thanh toán online
├── external/ghn/               # Tích hợp Giao Hàng Nhanh (tỉnh/huyện/xã, phí ship, tạo đơn)
├── generated/prisma/           # Prisma Client được generate (không sửa tay)
├── shared/                     # Xử lý lỗi service dùng chung
├── utils/
└── features/
    ├── auth/                   # Đăng ký, OTP, đăng nhập (local/Google/Facebook), refresh, quên/đổi mật khẩu
    ├── users/                  # Quản lý user, self-service profile + địa chỉ của chính mình
    ├── user_addresses/         # Quản trị địa chỉ của MỌI người dùng (admin)
    ├── rbac/                   # Role & Permission (tạo role, gán/thu hồi quyền)
    ├── categories/             # Danh mục sản phẩm (cây phân cấp, slug tiếng Việt)
    ├── products/               # Sản phẩm + biến thể (SKU) + ảnh theo từng SKU
    ├── carts/                  # Giỏ hàng
    ├── coupons/                # Mã giảm giá (cố định / phần trăm, coupon chào mừng theo email)
    ├── orders/                 # Đặt hàng, tính phí ship GHN, hủy đơn, webhook GHN
    ├── payments/               # Trạng thái thanh toán + cổng thanh toán (gateways/)
    ├── reviews/                # Đánh giá sản phẩm
    ├── contacts/               # Form liên hệ
    ├── notifications/          # Thông báo in-app (tự bắn khi đơn hàng/thanh toán đổi trạng thái, shop phản hồi review... + admin broadcast hàng loạt)
    ├── dashboard/              # Thống kê tổng quan cho admin
    └── uploads/                # Upload ảnh sản phẩm
```

Mỗi feature theo cùng một khuôn mẫu: `*.routes.ts` (định tuyến + khai báo quyền), `*.controller.ts`, `*.service.ts` (nghiệp vụ + Prisma), `*.validation.ts` (Zod schema), `*.utils.ts`, và `*.seed.ts` (dữ liệu mẫu khi khởi động).

Ảnh sơ đồ thư mục backend
![Ảnh sơ đồ thư mục backend](docs/images/project-structure/backend-structure.svg)

### 2.3. Mô hình dữ liệu (Prisma schema)

Các nhóm bảng chính (xem `backend/prisma/schema.prisma`):

1. **IAM**: `roles`, `permissions`, `role_permissions`, `users` (hỗ trợ login local + Google/Facebook), `refresh_tokens`, `user_addresses`.
2. **Catalog**: `categories` (cây phân cấp, tự tham chiếu), `products`, `product_sku` (mỗi dòng là 1 biến thể — màu/size riêng, có giá, tồn kho, kích thước/khối lượng vật lý để tính phí ship GHN), `product_images` (ảnh gắn theo từng SKU, không phải theo sản phẩm).
3. **Giỏ hàng**: `carts`, `cart_items`.
4. **Đơn hàng & thanh toán**: `coupons`, `orders` (lưu cả mã vận đơn + trạng thái vận chuyển GHN, và `delivered_at` — mốc thời gian chuyển sang "delivered", dùng để tính hạn 30 ngày được phép đánh giá), `order_items` (chụp lại giá & biến thể tại thời điểm mua), `payments` (state machine: `pending → completed/failed → refunded`), `checkout_idempotency_keys` (gate chống double-submit riêng cho luồng "Mua ngay" — xem 2.5).
5. **Tương tác khách hàng**: `reviews` (đánh giá theo mô hình **verified purchase** — gắn với `order_item` cụ thể, chỉ viết được trong 30 ngày kể từ `orders.delivered_at`, sửa tối đa 1 lần), `review_replies` (phản hồi chính thức của shop, tối đa 1/review), `review_moderation_logs` (lịch sử ẩn/hiện review vi phạm — không sửa nội dung gốc), `otps` (xác thực đăng ký / đặt lại mật khẩu / đổi SĐT), `contacts`.

Sơ đồ ERD Database
![Ảnh sơ đồ ERD Database](docs/images/project-structure/ERD.png)

### 2.4. Xác thực & phân quyền (RBAC)

- Đăng nhập trả về **access token** (ngắn hạn) + **refresh token** (cookie `httpOnly`), ký bằng 2 secret khác nhau.
- Middleware `authenticateJWT` xác thực access token; `requirePermission("<resource>:<action>")` kiểm tra quyền theo mô hình `resource:action` (vd: `catalog:write`, `order:read`).
- 3 role mặc định khi seed: **admin** (toàn quyền, tính động theo mọi permission hiện có), **manager** (vận hành: catalog, đơn hàng, kho, coupon, thanh toán, dashboard...), **customer** (giỏ hàng, đặt hàng, đánh giá, liên hệ).
- RBAC có thể tùy biến qua API `/api/rbac` (tạo role/permission mới, gán/thu hồi quyền) — dữ liệu seed chỉ chạy khi bảng đang trống, không ghi đè phân quyền admin đã chỉnh tay.

### 2.5. Danh sách API chính (tiền tố `/api`)

| Nhóm              | Route                                                                                                                                                                                                   | Ghi chú                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Auth              | `/auth/register`, `/verify-otp`, `/resend-otp`, `/login`, `/google`, `/facebook`, `/refresh-token`, `/logout`, `/forgot-password`, `/reset-password`, `/me`                                             | Public, trừ `/me`                                                               |
| RBAC              | `/rbac/roles`, `/rbac/permissions`, `/rbac/roles/:id/permissions`                                                                                                                                       | Admin (`rbac:manage`)                                                           |
| Users             | `/users/me`, `/users/me/addresses`, `/users` (admin)                                                                                                                                                    | Self-service + Admin                                                            |
| Addresses (admin) | `/addresses`, `/addresses/user/:userId`                                                                                                                                                                 | Quản trị địa chỉ mọi user                                                       |
| Categories        | `/categories`, `/categories/featured`, `/categories/slug/:slug`, `/categories/id/:id` (admin)                                                                                                           | Public đọc, admin ghi                                                           |
| Products          | `/products`, `/products/featured`, `/products/slug/:slug`, `/products/admin`, `/products/id/:id/skus`, `.../images`                                                                                     | Public đọc, admin quản lý SKU/ảnh                                               |
| Cart              | `/cart`, `/cart/items`                                                                                                                                                                                  | Yêu cầu đăng nhập                                                               |
| Coupons           | `/coupons/request-welcome`, `/coupons/validate`, `/coupons` (admin CRUD)                                                                                                                                |                                                                                 |
| Reviews           | `/reviews/product/:productId`, `/reviews/reviewable-items`, `/reviews/me`, `/reviews` (tạo/sửa/xóa của chính khách), `/reviews/admin`, `/reviews/admin/:id/hide`, `/unhide`, `/reviews/admin/:id/reply` | Đánh giá theo mô hình verified-purchase (xem 2.3)                               |
| Contacts          | `/contacts` (public gửi), `/contacts/me`, `/contacts` (admin)                                                                                                                                           |                                                                                 |
| Notifications     | `/notifications` (self-service: xem/đánh dấu đã đọc/xóa), `/notifications/broadcast` (admin)                                                                                                            | Broadcast gửi TOÀN BỘ customer đang hoạt động                                   |
| Orders            | `/orders` (checkout), `/orders/shipping-fee`, `/orders/buy-now`, `/orders/buy-now/shipping-fee`, `/orders/me`, `/orders/admin`, `/orders/webhooks/ghn`                                                  | "Mua ngay" đặt hàng thẳng 1 SKU, không qua giỏ hàng; webhook GHN không cần auth |
| Payments          | `/payments/me/:orderId`, `/payments/me/:orderId/pay`, `/payments/vnpay/return`, `/payments/vnpay/ipn`, `/payments/zalopay/callback`, `/payments/admin`                                                  | Return/IPN không cần auth (gateway gọi trực tiếp)                               |
| Dashboard         | `/dashboard/overview`, `/revenue`, `/top-products`, `/recent-orders`, `/low-stock`                                                                                                                      | Admin                                                                           |
| Uploads           | `/uploads/product-image`                                                                                                                                                                                | Admin, multipart/form-data                                                      |
| GHN               | `/external/ghn/provinces`, `/districts`, `/wards`                                                                                                                                                       | Proxy tra cứu địa chỉ hành chính cho GHN                                        |

**"Mua ngay" (buy-now)**: bấm nút "Mua ngay" ở trang chi tiết sản phẩm sẽ đặt hàng thẳng đúng 1 SKU + số lượng đã chọn, **không đụng tới giỏ hàng** hiện có của khách (khác với checkout thường — luôn đọc/xoá từ giỏ hàng thật). Cả 2 luồng dùng chung 1 lõi xử lý trong `OrderService` (validate tồn kho trong transaction, áp coupon, trừ kho, tạo vận đơn GHN ngay nếu COD) để tránh lệch logic. Vì không có giỏ hàng để làm "gate" chống double-submit như checkout thường (xoá cart item bên trong transaction), luồng mua ngay dùng riêng bảng `checkout_idempotency_keys`: frontend tự sinh 1 UUID mỗi lần bấm "Đặt hàng", backend insert giá trị này làm dòng đầu tiên trong transaction — trùng khoá (double click, hoặc client tự động retry do mất mạng) sẽ bị chặn ngay lập tức, rollback toàn bộ.

Toàn bộ API trên được tài liệu hoá tự động dạng OpenAPI 3.0 — sinh trực tiếp từ Zod schema đang dùng thật trong validation (`backend/src/config/openapi.routes.ts`), luôn khớp với hành vi thực tế. Xem trực quan tại **Swagger UI** (`/api/docs`) hoặc import `/api/docs.json` vào Postman để test các route yêu cầu đăng nhập.

Ảnh giao diện Swagger UI — tổng quan API
![Ảnh giao diện Swagger UI — tổng quan API](docs/images/swagger/apis.png)

### 2.6. Tích hợp bên thứ ba

- **GHN (Giao Hàng Nhanh)**: tra cứu tỉnh/huyện/xã, tính phí vận chuyển thực tế theo kích thước/khối lượng từng SKU, tạo đơn, nhận webhook cập nhật trạng thái vận chuyển (`ghnStatus`, tách biệt với `orderStatus` nội bộ).
- **Cổng thanh toán**: VNPay và ZaloPay đã có gateway triển khai đầy đủ (`features/payments/gateways/`); MoMo/Stripe/PayPal đã có trong enum `PaymentMethod` và biến môi trường mẫu nhưng gateway MoMo chưa thấy code triển khai trong `gateways/` (chỉ VNPay + ZaloPay).
- **OAuth**: Google (idToken) và Facebook (accessToken + Graph API debug_token).
- **Email**: gửi OTP đăng ký / đặt lại mật khẩu / đổi SĐT qua Brevo Transactional Email API (HTTPS, không phải SMTP — tránh bị chặn outbound SMTP trên các nền tảng hosting như Railway/Render).
- **Cron job nội bộ**: tự động hủy đơn "pending" thanh toán online quá hạn (`PENDING_ORDER_TTL_HOURS`, mặc định 24h), hoàn lại tồn kho + lượt dùng coupon; không áp dụng cho đơn COD. Cùng lịch chạy này cũng dọn luôn các `checkout_idempotency_keys` cũ quá 24h (gate chống double-submit của luồng "Mua ngay").

### 2.7. Biến môi trường

Xem đầy đủ và có chú thích chi tiết bằng tiếng Việt tại `backend/.env.example`, gồm các nhóm: Core (`PORT`, `CLIENT_URL`), `DATABASE_URL` (MySQL), JWT secrets, SMTP, Google/Facebook OAuth, VNPay/MoMo/ZaloPay, GHN, và cấu hình job dọn đơn quá hạn.

### 2.8. Chạy backend

```bash
cd backend
npm install
cp .env.example .env.development   # điền giá trị thật
npm run db:migrate                 # chạy Prisma migration
npm run dev                        # tsx watch, tự seed roles/permissions/dữ liệu mẫu khi khởi động
```

Các script khác: `npm run build` (prisma generate + tsc), `npm start` (chạy bản build), `npm run db:studio` (Prisma Studio), `npm run db:reset`.

---

## 3. Frontend (`frontend/`)

### 3.1. Công nghệ

- **React 19 + TypeScript + Vite**, styling bằng **Tailwind CSS v4** (dùng cú pháp `@theme` để định nghĩa design token).
- **React Router v7** (data router, dùng `loader` để bảo vệ route theo trạng thái đăng nhập/permission).
- **TanStack Query** cho data-fetching/caching, **Zustand** cho state client (giỏ hàng, auth).
- **Bảng màu**: lấy cảm hứng từ template Etonal (Webflow) — nền kem ấm (`--color-cream: #faf6f0`), mực gần đen (`--color-ink`), điểm nhấn cam cháy (`--color-primary: #d9641f`).
- Thư viện khác: `@react-oauth/google` (đăng nhập Google), `echarts` (biểu đồ dashboard admin), `react-toastify` (thông báo), `@strapi/blocks-react-renderer` (render rich text từ Strapi).

### 3.2. Kiến trúc thư mục — modular theo feature, tách rõ Admin / Client

```
frontend/src/
├── main.tsx, App.tsx
├── configs/
│   ├── apis/            # apiClient (backend, có auto-refresh token) + strapiClient (CMS)
│   ├── constants/         # đường dẫn (paths), danh sách permission FE dùng để check quyền
│   ├── query-client/       # cấu hình TanStack QueryClient
│   └── routes/            # khai báo toàn bộ route (client, admin, auth, 403, 404)
├── layouts/
│   ├── client/            # Header, Footer cho trang khách
│   ├── admin/             # Sidebar tối màu có thể thu gọn, header sticky, dropdown user
│   └── auth/
├── middlewares/            # requirePermissionLoader (chặn route theo RBAC ở React Router)
├── shared/                 # component & hằng số dùng chung
├── hooks/, utils/, types/
└── features/
    ├── auth/               # Zustand store, useAuth hook, service gọi /api/auth, route loader
    ├── external/location/    # Gọi API GHN (tỉnh/huyện/xã) cho form địa chỉ
    ├── client/              # home, shop, product, cart, order, payment, review, contact, notification, about, me (tài khoản)
    └── admin/               # dashboard, product, category, coupon, order, review, payment, user, rbac, contact, notification, header, sidebar
```

Mỗi feature con thường có: `components/`, `hooks/`, `services/` (gọi API), `types/`, `utils/`, đúng khuôn mẫu với backend để hai bên "nói cùng ngôn ngữ".

Ảnh sơ đồ thư mục frontend
![Ảnh sơ đồ thư mục frontend](docs/images/project-structure/frontend-structure.svg)

### 3.3. Giao diện Client (khách hàng)

Các trang: **Trang chủ, Cửa hàng (Shop), Chi tiết sản phẩm, Giỏ hàng, Thanh toán, Mua ngay, Kết quả thanh toán, Tài khoản của tôi, Giới thiệu, Liên hệ**, cùng luồng xác thực đầy đủ (Đăng nhập/Đăng ký/Quên-Khôi phục mật khẩu/Xác thực OTP).

- Giỏ hàng **không yêu cầu đăng nhập** (lưu ở Zustand + localStorage) — chỉ bắt đăng nhập khi vào bước Thanh toán.
- Trang Thanh toán tính phí vận chuyển GHN thật theo địa chỉ đã chọn, áp mã giảm giá, rồi tạo đơn hàng thật.
- Trang chi tiết sản phẩm có nút "Mua ngay" (chỉ hiện khi đã đăng nhập) đưa thẳng khách sang trang **Mua ngay** — thanh toán ngay với đúng 1 sản phẩm/SKU vừa chọn, không cần thêm vào giỏ hàng và không ảnh hưởng tới giỏ hàng hiện có; tái dùng lại các khối UI của trang Thanh toán (địa chỉ, phương thức vận chuyển/thanh toán, mã giảm giá) nhưng gọi API `/orders/buy-now` riêng.
- Trang chi tiết sản phẩm có tab "Đánh giá" (điểm trung bình, phân bổ theo sao, lọc/sắp xếp, phản hồi của shop); tab "Đánh giá của tôi" trong trang tài khoản cho phép viết đánh giá cho sản phẩm đã mua (đơn đã giao, còn trong hạn 30 ngày) và sửa (tối đa 1 lần)/xóa đánh giá đã viết.
- Nội dung tĩnh của Trang chủ / Giới thiệu / Liên hệ / banner Cửa hàng được lấy từ **Strapi CMS** (không hard-code trong code frontend), cho phép chỉnh nội dung marketing mà không cần deploy lại.

Trang chủ
![Ảnh giao diện trang chủ client](docs/images/client/home.png)

Trang giới thiệu
![Ảnh giao diện trang giới thiệu](docs/images/client/about.png)

Trang liên hệ
![Ảnh giao diện trang liên hệ](docs/images/client/contact.png)

Trang cửa hàng
![Ảnh giao diện trang sản phẩm](docs/images/client/shop.png)

Trang sản phẩm & đánh giá
![Ảnh giao diện trang chi tiết sản phẩm](docs/images/client/product.png)
![Ảnh giao diện đánh giá của sản phẩm](docs/images/client/review.png)

Trang giỏ hàng
![Ảnh giao diện trang giỏ hàng](docs/images/client/cart.png)

Trang thanh toán
![Ảnh giao diện trang thanh toán](docs/images/client/checkout.png)

Trang đặt hàng thành công
![Ảnh giao diện đặt hàng thành công](docs/images/client/checkout-success.png)

Trang đơn hàng của tôi
![Ảnh giao diện trang đơn hàng của tôi](docs/images/client/order-me.png)

Trang chi tiết đơn hàng của tôi
![Ảnh giao diện trang chi tiết đơn hàng của tôi](docs/images/client/order-detail-me.png)

Trang quản lý thông báo của tôi
![Ảnh giao diện quản lý thông báo của tôi](docs/images/client/notifications.png)

Trang quản lý đánh giá của tôi
![Ảnh giao diện quản lý đánh giá](docs/images/client/me-reviews.png)

Trang quản lý sổ địa chỉ của tôi
![Ảnh giao diện quản lý sổ địa chi của tôi](docs/images/client/me-addresses.png)

Trang quản lý thông tin cá nhân
![Ảnh giao diện quản lý thông tin cá nhân](docs/images/client/me-info.png)

Trang quản lý liên hệ của tôi
![Ảnh giao diện quản lý liên hệ của tôi](docs/images/client/me-contacts.png)

### 3.4. Giao diện Admin

Layout riêng (`/admin`) với sidebar tối màu có thể thu gọn, mọi route đều được bảo vệ bằng `requirePermissionLoader` khớp với hệ permission của backend. Các trang quản trị: **Dashboard** (số liệu tổng quan, doanh thu, top sản phẩm, đơn gần đây, sản phẩm sắp hết hàng), **Sản phẩm** (kèm trang chi tiết quản lý SKU/ảnh), **Danh mục**, **Người dùng**, **Vai trò & phân quyền (RBAC)** — có ma trận quyền, **Mã giảm giá**, **Đơn hàng**, **Đánh giá sản phẩm** (kiểm duyệt ẩn/hiện kèm lý do, phản hồi chính thức), **Thanh toán**, **Liên hệ**, **Thông báo** (gửi hàng loạt).

Trang dashboard admin
![Ảnh giao diện Dashboard Admin](docs/images/admin/dashboard.png)

Trang quản lý RBAC / ma trận quyền
![Ảnh giao diện quản lý RBAC / ma trận quyền](docs/images/admin/rbac.png)

Trang quản lý danh mục phân cấp
![Ảnh giao diện quản lý danh mục phân cấp](docs/images/admin/categories.png)

Trang quản lý sản phẩm
![Ảnh giao diện quản lý sản phẩm](docs/images/admin/products.png)

Trang quản lý biến thể của sản phẩm
![Ảnh giao diện quản lý biến thể của sản phẩm](docs/images/admin/product-variation.png)

Trang quản lý mã giảm giá
![Ảnh giao diện quản lý mã giảm giá](docs/images/admin/coupons.png)

Trang quản lý thông báo
![Ảnh giao diện quản lý thông báo](docs/images/admin/notifications.png)
![Ảnh giao diện quản lý thông báo](docs/images/admin/notifications-2.png)

Trang quản lý thanh toán
![Ảnh giao diện quản lý thanh toán](docs/images/admin/payments.png)

Trang quản lý đơn hàng
![Ảnh giao diện quản lý đơn hàng](docs/images/admin/orders.png)

Trang quản lý người dùng
![Ảnh giao diện quản lý người dùng](docs/images/admin/users.png)

Trang quản lý đánh giá
![Ảnh giao diện quản lý đánh giá](docs/images/admin/review.png)

Trang quản lý liên hệ
![Ảnh giao diện quản lý liên hệ](docs/images/admin/contacts.png)

### 3.5. Hệ thống thông báo (Notification)

**Domain Client** (`features/client/notification/`):

- Icon chuông ở header: dropdown xem nhanh 5 thông báo gần nhất, badge số chưa đọc. Poll `GET /notifications` mỗi 30s (backend chưa có kênh real-time) để tự cập nhật không cần F5. Chỉ hiện khi đã đăng nhập.
- Tab "Quản lý thông báo" trong trang tài khoản: danh sách đầy đủ có phân trang, đánh dấu đã đọc (từng cái/tất cả), xóa (từng cái/toàn bộ thông báo đã đọc — có xác nhận trước khi xóa hàng loạt).
- Click 1 thông báo (loại đơn hàng/thanh toán) điều hướng thẳng tới đúng đơn hàng đó trong tab "Đơn hàng"; thông báo "shop đã phản hồi đánh giá" điều hướng thẳng tới trang chi tiết sản phẩm, tự chuyển sang tab "Đánh giá" và cuộn/highlight đúng review đó — kể cả khi đang đứng sẵn ở trang chi tiết sản phẩm đó (tab khác) hoặc bấm lại đúng thông báo đã bấm trước đó.

**Domain Admin** (`features/admin/notification/`, `pages/admin/notification/`):

- Trang gửi thông báo hàng loạt (`/admin/notification`, quyền `notification:broadcast`): chọn loại (khuyến mãi/hệ thống), nhập tiêu đề + nội dung, gửi tới **toàn bộ customer đang hoạt động** (không hỗ trợ chọn tay từng người) — có bước xác nhận trước khi gửi vì không thể thu hồi.
- Backend xử lý theo batch (500 user/lần, cursor pagination) thay vì 1 câu query duy nhất, tránh nghẽn server khi lượng khách hàng lớn.

Kiến trúc kênh gửi ở backend theo Strategy Pattern (`features/notifications/channels/`) — hiện chỉ có kênh in-app/DB, thiết kế sẵn để mở rộng thêm email/push sau này mà không cần sửa lại phần điều phối (`notification.service.ts`).

### 3.6. Xác thực phía frontend

- `apiClient` dùng cookie `httpOnly` (`withCredentials: true`), có interceptor: khi gặp `401` sẽ tự gọi `/auth/refresh-token`, gom các request đang chờ (tránh gọi refresh nhiều lần cùng lúc), và tự redirect về trang đăng nhập nếu refresh thất bại (trừ chính request `/auth/me` — vì `401` ở đó là trạng thái hợp lệ khi khách chưa đăng nhập ghé trang public).
- `guestOnlyLoader` chặn user đã đăng nhập vào lại trang login/register; `requireAuthLoader` bắt đăng nhập; `requirePermissionLoader(permission)` bắt đúng quyền cho từng route admin.

### 3.7. Biến môi trường

Xem `frontend/.env.example`: `VITE_API_BASE_URL` (backend), `VITE_STRAPI_BASE_URL` (CMS), `VITE_GOOGLE_CLIENT_ID`, cấu hình Facebook SDK (`VITE_FACEBOOK_APP_ID`, script id, script src, version).

### 3.8. Chạy frontend

```bash
cd frontend
npm install
cp .env.example .env    # điền giá trị thật, trỏ VITE_API_BASE_URL sang backend đang chạy
npm run dev
```

Script khác: `npm run build` (`tsc -b && vite build`), `npm run preview`, `npm run lint`.

---

## 4. Strapi CMS (`strapi-cms/`)

### 4.1. Vai trò

CMS phụ trợ (Strapi 5) quản lý **nội dung tĩnh/marketing** cho frontend, tách biệt hoàn toàn khỏi dữ liệu giao dịch ở backend Express. Frontend gọi qua `strapiClient` (axios riêng, không chia sẻ auth với backend chính).

### 4.2. Content types đã định nghĩa (Single Types)

| Content type   | Mục đích              | Thành phần chính                                                                     |
| -------------- | --------------------- | ------------------------------------------------------------------------------------ |
| `home`         | Trang chủ             | `hero_section` (Story section), `value_item` (danh sách lặp)                         |
| `about-page`   | Trang giới thiệu      | `breadcrumb`, `story_section`, `stats_section` (lặp), `value_section`, `cta_section` |
| `contact-page` | Trang liên hệ         | (chưa có field tuỳ biến — dùng cấu trúc mặc định)                                    |
| `shop-page`    | Banner/trang Cửa hàng | (chưa có field tuỳ biến)                                                             |

### 4.3. Components tái sử dụng (`src/components/sections/`)

`breadcrumb`, `story-section` (badge/title/nội dung rich-text/banner ảnh/2 nút CTA), `stats-section` (value + label, lặp lại), `value-section` + `value-item` (icon/title/description, lặp lại), `cta-section` (title/description/nút).

Ảnh giao diện Strapi CMS Headless Admin panel - Chỉnh nội dung trang chủ
![Ảnh giao diện Strapi Admin panel — chỉnh nội dung trang chủ](docs/images/strapi-cms/content-management.png)

### 4.4. Chạy Strapi CMS

```bash
cd strapi-cms
npm install
cp .env.example .env    # điền giá trị thật
npm run develop         # mở Strapi Admin tại http://localhost:1337/admin
```

Dùng `better-sqlite3` làm database mặc định (phù hợp dev cục bộ); có thể đổi sang DB khác qua cấu hình `config/database`.

---

## 5. Chạy toàn bộ hệ thống (dev)

1. **Database**: chuẩn bị MySQL, tạo `DATABASE_URL` cho backend.
2. **Backend**: `cd backend && npm install && npm run db:migrate && npm run dev` (mặc định `http://localhost:5000` hoặc theo `PORT`).
3. **Strapi CMS**: `cd strapi-cms && npm install && npm run develop` (mặc định `http://localhost:1337`).
4. **Frontend**: `cd frontend && npm install`, cấu hình `.env` trỏ đúng `VITE_API_BASE_URL` (backend) và `VITE_STRAPI_BASE_URL` (Strapi), rồi `npm run dev` (mặc định Vite `http://localhost:5173`).
5. Với các luồng cần callback công khai từ internet khi phát triển local (webhook GHN, IPN VNPay/ZaloPay/MoMo), cần dùng tunnel (ngrok/cloudflared) trỏ vào backend.

Ảnh sơ đồ luồng chạy dev 3 service song song
![Ảnh sơ đồ luồng chạy dev 3 service song song](docs/images/project-structure/dev-flow.svg)

---

## 6. Tóm tắt điểm nổi bật

- Kiến trúc **modular theo feature**, quy ước đặt tên nhất quán giữa backend và frontend giúp dễ tra cứu.
- **RBAC linh hoạt** (resource:action), seed mặc định 3 role nhưng có thể tùy biến qua UI/API mà không bị seed ghi đè.
- **Tích hợp vận chuyển & thanh toán thực tế cho thị trường Việt Nam**: GHN tính phí ship theo kích thước/khối lượng từng biến thể sản phẩm, VNPay & ZaloPay, cơ chế tự hủy đơn "pending" quá hạn.
- **"Mua ngay"**: đặt hàng thẳng 1 sản phẩm từ trang chi tiết sản phẩm mà không qua giỏ hàng, dùng chung lõi xử lý đơn hàng với checkout thường; chống double-submit bằng idempotency key riêng vì không có giỏ hàng để làm "gate" như checkout thường.
- **Tách CMS khỏi hệ thống giao dịch**: nội dung marketing (Home/About/Contact/Shop banner) quản lý độc lập qua Strapi, không cần deploy lại frontend khi đổi nội dung.
- **Hệ thống thông báo in-app**: tự động bắn khi đơn hàng/thanh toán đổi trạng thái, admin gửi hàng loạt tới toàn bộ khách hàng (xử lý theo batch), kiến trúc kênh gửi (Strategy Pattern) sẵn sàng mở rộng thêm email/push.
- **Đánh giá sản phẩm theo mô hình verified-purchase**: chỉ đánh giá được sản phẩm đã mua và đơn đã giao, trong vòng 30 ngày kể từ ngày nhận hàng; sửa tối đa 1 lần; kiểm duyệt viên chỉ ẩn/hiện chứ không sửa nội dung gốc, mọi thao tác được ghi log để đối soát.
- Giao diện Client lấy cảm hứng từ **Etonal** (tông màu kem – cam cháy), giao diện Admin có dashboard trực quan bằng ECharts.

## 7. Định hướng phát triển tiếp theo

- **Thanh toán**: Tích hợp thêm các cổng thanh toán online phổ biến khác như MoMo, PayPal, Stripe.
- **Trải nghiệm người dùng**: Tiếp tục tinh chỉnh UI/UX cho cả giao diện Client và Admin.
- **Thông báo real-time**: Hiện thông báo mới cập nhật qua polling (30s) — nâng cấp lên WebSocket để đẩy tức thời, và bổ sung thêm kênh gửi email/push (đã có sẵn interface `NotificationChannel`, chỉ cần thêm implementation mới).
- **Chat trực tuyến**: Bổ sung tính năng hỗ trợ khách hàng realtime.
- **Bảo hành sản phẩm**: Bổ sung tính năng quản lý bảo hành sản phẩm.
- **AI**: Nghiên cứu và tích hợp AI vào các luồng nghiệp vụ của dự án (gợi ý sản phẩm, chatbot hỗ trợ...).
