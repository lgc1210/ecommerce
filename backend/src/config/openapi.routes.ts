import type { ZodObject } from "zod";

import { RegisterSchema, VerifyOtpSchema, ResendOtpSchema, LoginSchema, GoogleLoginSchema, FacebookLoginSchema, ForgotPasswordSchema, ResetPasswordSchema } from "../features/auth/auth.validation.js";
import { CreateRoleSchema, RoleIdParamSchema, CreatePermissionSchema, AssignPermissionsSchema, RevokePermissionParamSchema } from "../features/rbac/rbac.validation.js";
import {
	UpdateOwnProfileSchema,
	CreateAddressSchema,
	UpdateAddressSchema,
	AddressIdParamSchema as OwnAddressIdParamSchema,
	CreateUserSchema,
	ListUsersQuerySchema,
	UserIdParamSchema,
	UpdateUserRoleSchema,
	UpdateUserStatusSchema,
} from "../features/users/user.validation.js";
import { ListAddressesQuerySchema, AddressIdParamSchema, AdminUpdateAddressSchema } from "../features/user_addresses/user_address.validation.js";
import {
	ListCategoriesQuerySchema,
	FeaturedCategoriesQuerySchema,
	CategorySlugParamSchema,
	CategoryIdParamSchema,
	CreateCategorySchema,
	UpdateCategorySchema,
} from "../features/categories/category.validation.js";
import {
	ListProductsQuerySchema,
	FeaturedProductsQuerySchema,
	ProductSlugParamSchema,
	ProductIdParamSchema,
	CreateProductSchema,
	UpdateProductSchema,
	CreateSkuSchema,
	UpdateSkuSchema,
	UpdateStockSchema,
	SkuParamSchema,
	CreateSkuImageSchema,
	UpdateSkuImageSchema,
	SkuImageParamSchema,
} from "../features/products/product.validation.js";
import { AddCartItemSchema, UpdateCartItemSchema, CartItemParamSchema } from "../features/carts/cart.validation.js";
import { RequestWelcomeCouponSchema, ValidateCouponSchema, ListCouponsQuerySchema, CouponIdParamSchema, CreateCouponSchema, UpdateCouponSchema } from "../features/coupons/coupon.validation.js";
import { ListReviewsByProductQuerySchema, CreateReviewSchema, UpdateReviewSchema, ReviewIdParamSchema, ListReviewsAdminQuerySchema } from "../features/reviews/review.validation.js";
import { CreateContactSchema, ListOwnContactsQuerySchema, ListContactsQuerySchema, ContactIdParamSchema, UpdateContactStatusSchema } from "../features/contacts/contact.validation.js";
import {
	GhnWebhookSchema,
	CreateOrderSchema,
	PreviewShippingFeeSchema,
	ListOwnOrdersQuerySchema,
	OrderIdParamSchema,
	ListOrdersAdminQuerySchema,
	UpdateOrderStatusSchema,
} from "../features/orders/order.validation.js";
import { OwnPaymentParamSchema, ConfirmOwnPaymentSchema, ListPaymentsAdminQuerySchema, PaymentIdParamSchema, UpdatePaymentStatusSchema } from "../features/payments/payment.validation.js";
import { RevenueSeriesQuerySchema, TopProductsQuerySchema, RecentOrdersQuerySchema, LowStockQuerySchema } from "../features/dashboard/dashboard.validation.js";
import { ListOwnNotificationsQuerySchema, NotificationIdParamSchema, BroadcastNotificationSchema } from "../features/notifications/notification.validation.js";
import { DistrictSchema, WardSchema } from "../external/ghn/ghn.validation.js";

export interface RouteMeta {
	method: "get" | "post" | "patch" | "delete";
	/** Đường dẫn TÍNH TỪ SAU "/api" (không lặp lại tiền tố /api ở đây), theo cú pháp Express (":id"). */
	path: string;
	tag: string;
	summary: string;
	/** true = bắt buộc đăng nhập, "optional" = không bắt buộc nhưng có gắn userId nếu có cookie hợp lệ. */
	auth?: boolean | "optional";
	/** resource:action theo hệ RBAC — undefined nếu route không qua requirePermission. */
	permission?: string;
	/** Schema dạng z.object({ body?, query?, params? }) — đúng schema dùng trong middleware validate(). */
	schema?: ZodObject<any>;
}

// prettier-ignore
export const routeManifest: RouteMeta[] = [
	// ── Auth ──────────────────────────────────────────────────────────────
	{ method: "post", path: "/auth/register", tag: "Auth", summary: "Đăng ký tài khoản mới (gửi OTP xác thực qua email)", schema: RegisterSchema },
	{ method: "post", path: "/auth/verify-otp", tag: "Auth", summary: "Xác thực OTP đăng ký", schema: VerifyOtpSchema },
	{ method: "post", path: "/auth/resend-otp", tag: "Auth", summary: "Gửi lại mã OTP", schema: ResendOtpSchema },
	{ method: "post", path: "/auth/login", tag: "Auth", summary: "Đăng nhập bằng email/mật khẩu", schema: LoginSchema },
	{ method: "post", path: "/auth/google", tag: "Auth", summary: "Đăng nhập bằng Google idToken", schema: GoogleLoginSchema },
	{ method: "post", path: "/auth/facebook", tag: "Auth", summary: "Đăng nhập bằng Facebook accessToken", schema: FacebookLoginSchema },
	{ method: "post", path: "/auth/refresh-token", tag: "Auth", summary: "Làm mới access token từ refresh token (cookie)" },
	{ method: "post", path: "/auth/logout", tag: "Auth", summary: "Đăng xuất, xoá cookie phiên đăng nhập" },
	{ method: "post", path: "/auth/forgot-password", tag: "Auth", summary: "Yêu cầu OTP đặt lại mật khẩu", schema: ForgotPasswordSchema },
	{ method: "post", path: "/auth/reset-password", tag: "Auth", summary: "Đặt lại mật khẩu bằng OTP", schema: ResetPasswordSchema },
	{ method: "get", path: "/auth/me", tag: "Auth", summary: "Lấy thông tin phiên đăng nhập hiện tại", auth: true },

	// ── RBAC ──────────────────────────────────────────────────────────────
	{ method: "post", path: "/rbac/roles", tag: "RBAC", summary: "Tạo role mới", auth: true, permission: "rbac:manage", schema: CreateRoleSchema },
	{ method: "get", path: "/rbac/roles", tag: "RBAC", summary: "Danh sách role", auth: true, permission: "rbac:manage" },
	{ method: "get", path: "/rbac/roles/:roleId", tag: "RBAC", summary: "Chi tiết 1 role kèm permission", auth: true, permission: "rbac:manage", schema: RoleIdParamSchema },
	{ method: "post", path: "/rbac/permissions", tag: "RBAC", summary: "Tạo permission mới", auth: true, permission: "rbac:manage", schema: CreatePermissionSchema },
	{ method: "get", path: "/rbac/permissions", tag: "RBAC", summary: "Danh sách permission", auth: true, permission: "rbac:manage" },
	{ method: "post", path: "/rbac/roles/:roleId/permissions", tag: "RBAC", summary: "Gán danh sách permission cho role", auth: true, permission: "rbac:manage", schema: AssignPermissionsSchema },
	{ method: "delete", path: "/rbac/roles/:roleId/permissions/:permissionId", tag: "RBAC", summary: "Thu hồi 1 permission khỏi role", auth: true, permission: "rbac:manage", schema: RevokePermissionParamSchema },

	// ── Users (self-service + admin) ─────────────────────────────────────
	{ method: "patch", path: "/users/me", tag: "Users", summary: "Cập nhật hồ sơ của chính mình", auth: true, schema: UpdateOwnProfileSchema },
	{ method: "get", path: "/users/me/addresses", tag: "Users", summary: "Danh sách địa chỉ của chính mình", auth: true },
	{ method: "post", path: "/users/me/addresses", tag: "Users", summary: "Thêm địa chỉ mới cho chính mình", auth: true, schema: CreateAddressSchema },
	{ method: "patch", path: "/users/me/addresses/:addressId", tag: "Users", summary: "Cập nhật 1 địa chỉ của chính mình", auth: true, schema: UpdateAddressSchema },
	{ method: "patch", path: "/users/me/addresses/:addressId/default", tag: "Users", summary: "Đặt 1 địa chỉ làm mặc định", auth: true, schema: OwnAddressIdParamSchema },
	{ method: "delete", path: "/users/me/addresses/:addressId", tag: "Users", summary: "Xoá 1 địa chỉ của chính mình", auth: true, schema: OwnAddressIdParamSchema },
	{ method: "post", path: "/users", tag: "Users", summary: "[Admin] Tạo user mới", auth: true, permission: "user:write", schema: CreateUserSchema },
	{ method: "get", path: "/users", tag: "Users", summary: "[Admin] Danh sách user", auth: true, permission: "user:read", schema: ListUsersQuerySchema },
	{ method: "get", path: "/users/:id", tag: "Users", summary: "[Admin] Chi tiết 1 user", auth: true, permission: "user:read", schema: UserIdParamSchema },
	{ method: "patch", path: "/users/:id/role", tag: "Users", summary: "[Admin] Đổi role của 1 user", auth: true, permission: "user:write", schema: UpdateUserRoleSchema },
	{ method: "patch", path: "/users/:id/status", tag: "Users", summary: "[Admin] Khoá/mở khoá 1 user", auth: true, permission: "user:write", schema: UpdateUserStatusSchema },

	// ── Addresses (admin — quản trị địa chỉ MỌI người dùng) ──────────────
	{ method: "get", path: "/addresses", tag: "Addresses (Admin)", summary: "Danh sách toàn bộ địa chỉ", auth: true, permission: "user:read", schema: ListAddressesQuerySchema },
	{ method: "get", path: "/addresses/:addressId", tag: "Addresses (Admin)", summary: "Chi tiết 1 địa chỉ", auth: true, permission: "user:read", schema: AddressIdParamSchema },
	{ method: "get", path: "/addresses/user/:userId", tag: "Addresses (Admin)", summary: "Danh sách địa chỉ của 1 user", auth: true, permission: "user:read", schema: UserIdParamSchema },
	{ method: "patch", path: "/addresses/:addressId", tag: "Addresses (Admin)", summary: "Cập nhật 1 địa chỉ bất kỳ", auth: true, permission: "user:write", schema: AdminUpdateAddressSchema },
	{ method: "delete", path: "/addresses/:addressId", tag: "Addresses (Admin)", summary: "Xoá 1 địa chỉ bất kỳ", auth: true, permission: "user:write", schema: AddressIdParamSchema },

	// ── Categories ────────────────────────────────────────────────────────
	{ method: "get", path: "/categories", tag: "Categories", summary: "Danh sách danh mục (public, dạng cây)", schema: ListCategoriesQuerySchema },
	{ method: "get", path: "/categories/featured", tag: "Categories", summary: "Danh mục nổi bật (public)", schema: FeaturedCategoriesQuerySchema },
	{ method: "get", path: "/categories/slug/:slug", tag: "Categories", summary: "Chi tiết danh mục theo slug (public)", schema: CategorySlugParamSchema },
	{ method: "get", path: "/categories/id/:id", tag: "Categories", summary: "[Admin] Chi tiết danh mục theo id", auth: true, permission: "catalog:read", schema: CategoryIdParamSchema },
	{ method: "post", path: "/categories", tag: "Categories", summary: "[Admin] Tạo danh mục mới", auth: true, permission: "catalog:write", schema: CreateCategorySchema },
	{ method: "patch", path: "/categories/id/:id", tag: "Categories", summary: "[Admin] Cập nhật danh mục", auth: true, permission: "catalog:write", schema: UpdateCategorySchema },
	{ method: "delete", path: "/categories/id/:id", tag: "Categories", summary: "[Admin] Xoá danh mục", auth: true, permission: "catalog:write", schema: CategoryIdParamSchema },

	// ── Products ─────────────────────────────────────────────────────────
	{ method: "get", path: "/products", tag: "Products", summary: "Danh sách sản phẩm (public, filter/sort/paginate)", schema: ListProductsQuerySchema },
	{ method: "get", path: "/products/featured", tag: "Products", summary: "Sản phẩm nổi bật (public)", schema: FeaturedProductsQuerySchema },
	{ method: "get", path: "/products/slug/:slug", tag: "Products", summary: "Chi tiết sản phẩm theo slug (public)", schema: ProductSlugParamSchema },
	{ method: "get", path: "/products/admin", tag: "Products", summary: "[Admin] Danh sách sản phẩm (kèm bản nháp/ẩn)", auth: true, permission: "catalog:read", schema: ListProductsQuerySchema },
	{ method: "get", path: "/products/id/:id", tag: "Products", summary: "[Admin] Chi tiết sản phẩm theo id", auth: true, permission: "catalog:read", schema: ProductIdParamSchema },
	{ method: "post", path: "/products", tag: "Products", summary: "[Admin] Tạo sản phẩm mới", auth: true, permission: "catalog:write", schema: CreateProductSchema },
	{ method: "patch", path: "/products/id/:id", tag: "Products", summary: "[Admin] Cập nhật sản phẩm", auth: true, permission: "catalog:write", schema: UpdateProductSchema },
	{ method: "delete", path: "/products/id/:id", tag: "Products", summary: "[Admin] Xoá sản phẩm", auth: true, permission: "catalog:write", schema: ProductIdParamSchema },
	{ method: "post", path: "/products/id/:id/skus", tag: "Products", summary: "[Admin] Thêm biến thể (SKU) cho sản phẩm", auth: true, permission: "catalog:write", schema: CreateSkuSchema },
	{ method: "patch", path: "/products/id/:id/skus/:skuId", tag: "Products", summary: "[Admin] Cập nhật 1 SKU", auth: true, permission: "catalog:write", schema: UpdateSkuSchema },
	{ method: "patch", path: "/products/id/:id/skus/:skuId/stock", tag: "Products", summary: "[Admin] Cập nhật tồn kho 1 SKU", auth: true, permission: "inventory:update", schema: UpdateStockSchema },
	{ method: "delete", path: "/products/id/:id/skus/:skuId", tag: "Products", summary: "[Admin] Xoá 1 SKU", auth: true, permission: "catalog:write", schema: SkuParamSchema },
	{ method: "post", path: "/products/id/:id/skus/:skuId/images", tag: "Products", summary: "[Admin] Thêm ảnh cho 1 SKU", auth: true, permission: "catalog:write", schema: CreateSkuImageSchema },
	{ method: "patch", path: "/products/id/:id/skus/:skuId/images/:imageId", tag: "Products", summary: "[Admin] Cập nhật 1 ảnh SKU (vd. đặt ảnh chính)", auth: true, permission: "catalog:write", schema: UpdateSkuImageSchema },
	{ method: "delete", path: "/products/id/:id/skus/:skuId/images/:imageId", tag: "Products", summary: "[Admin] Xoá 1 ảnh SKU", auth: true, permission: "catalog:write", schema: SkuImageParamSchema },

	// ── Cart ─────────────────────────────────────────────────────────────
	{ method: "get", path: "/cart", tag: "Cart", summary: "Xem giỏ hàng của mình", auth: true, permission: "cart:manage" },
	{ method: "post", path: "/cart/items", tag: "Cart", summary: "Thêm sản phẩm vào giỏ (upsert nếu trùng SKU)", auth: true, permission: "cart:manage", schema: AddCartItemSchema },
	{ method: "patch", path: "/cart/items/:itemId", tag: "Cart", summary: "Cập nhật số lượng 1 item trong giỏ", auth: true, permission: "cart:manage", schema: UpdateCartItemSchema },
	{ method: "delete", path: "/cart/items/:itemId", tag: "Cart", summary: "Xoá 1 item khỏi giỏ", auth: true, permission: "cart:manage", schema: CartItemParamSchema },
	{ method: "delete", path: "/cart", tag: "Cart", summary: "Xoá sạch giỏ hàng", auth: true, permission: "cart:manage" },

	// ── Coupons ──────────────────────────────────────────────────────────
	{ method: "post", path: "/coupons/request-welcome", tag: "Coupons", summary: "Yêu cầu mã giảm giá chào mừng theo email (public)", schema: RequestWelcomeCouponSchema },
	{ method: "post", path: "/coupons/validate", tag: "Coupons", summary: "Kiểm tra mã giảm giá có áp dụng được không", auth: true, schema: ValidateCouponSchema },
	{ method: "get", path: "/coupons", tag: "Coupons", summary: "[Admin] Danh sách mã giảm giá", auth: true, permission: "coupon:manage", schema: ListCouponsQuerySchema },
	{ method: "get", path: "/coupons/id/:id", tag: "Coupons", summary: "[Admin] Chi tiết 1 mã giảm giá", auth: true, permission: "coupon:manage", schema: CouponIdParamSchema },
	{ method: "post", path: "/coupons", tag: "Coupons", summary: "[Admin] Tạo mã giảm giá mới", auth: true, permission: "coupon:manage", schema: CreateCouponSchema },
	{ method: "patch", path: "/coupons/id/:id", tag: "Coupons", summary: "[Admin] Cập nhật mã giảm giá", auth: true, permission: "coupon:manage", schema: UpdateCouponSchema },
	{ method: "delete", path: "/coupons/id/:id", tag: "Coupons", summary: "[Admin] Xoá mã giảm giá", auth: true, permission: "coupon:manage", schema: CouponIdParamSchema },

	// ── Reviews ──────────────────────────────────────────────────────────
	{ method: "get", path: "/reviews/product/:productId", tag: "Reviews", summary: "Danh sách đánh giá của 1 sản phẩm (public)", schema: ListReviewsByProductQuerySchema },
	{ method: "post", path: "/reviews", tag: "Reviews", summary: "Gửi đánh giá sản phẩm", auth: true, permission: "review:create", schema: CreateReviewSchema },
	{ method: "patch", path: "/reviews/:id", tag: "Reviews", summary: "Sửa đánh giá của chính mình", auth: true, permission: "review:create", schema: UpdateReviewSchema },
	{ method: "delete", path: "/reviews/:id", tag: "Reviews", summary: "Xoá đánh giá của chính mình", auth: true, permission: "review:create", schema: ReviewIdParamSchema },
	{ method: "get", path: "/reviews/admin", tag: "Reviews", summary: "[Admin] Danh sách toàn bộ đánh giá", auth: true, permission: "review:update", schema: ListReviewsAdminQuerySchema },
	{ method: "delete", path: "/reviews/admin/:id", tag: "Reviews", summary: "[Admin] Xoá 1 đánh giá bất kỳ", auth: true, permission: "review:update", schema: ReviewIdParamSchema },

	// ── Contacts ─────────────────────────────────────────────────────────
	{ method: "post", path: "/contacts", tag: "Contacts", summary: "Gửi form liên hệ (không bắt buộc đăng nhập)", auth: "optional", schema: CreateContactSchema },
	{ method: "get", path: "/contacts/me", tag: "Contacts", summary: "Danh sách liên hệ mình đã gửi", auth: true, schema: ListOwnContactsQuerySchema },
	{ method: "get", path: "/contacts", tag: "Contacts", summary: "[Admin] Danh sách toàn bộ liên hệ", auth: true, permission: "contact:manage", schema: ListContactsQuerySchema },
	{ method: "get", path: "/contacts/:id", tag: "Contacts", summary: "[Admin] Chi tiết 1 liên hệ", auth: true, permission: "contact:manage", schema: ContactIdParamSchema },
	{ method: "patch", path: "/contacts/:id/status", tag: "Contacts", summary: "[Admin] Cập nhật trạng thái xử lý liên hệ", auth: true, permission: "contact:manage", schema: UpdateContactStatusSchema },
	{ method: "delete", path: "/contacts/:id", tag: "Contacts", summary: "[Admin] Xoá 1 liên hệ", auth: true, permission: "contact:manage", schema: ContactIdParamSchema },

	// ── Orders ───────────────────────────────────────────────────────────
	{ method: "post", path: "/orders/webhooks/ghn", tag: "Orders", summary: "Webhook GHN cập nhật trạng thái vận chuyển (không cần auth)", schema: GhnWebhookSchema },
	{ method: "post", path: "/orders", tag: "Orders", summary: "Đặt hàng (checkout)", auth: true, permission: "order:create", schema: CreateOrderSchema },
	{ method: "post", path: "/orders/shipping-fee", tag: "Orders", summary: "Xem trước phí vận chuyển GHN", auth: true, permission: "order:create", schema: PreviewShippingFeeSchema },
	{ method: "get", path: "/orders/me", tag: "Orders", summary: "Danh sách đơn hàng của mình", auth: true, permission: "order:read", schema: ListOwnOrdersQuerySchema },
	{ method: "get", path: "/orders/me/:id", tag: "Orders", summary: "Chi tiết 1 đơn hàng của mình", auth: true, permission: "order:read", schema: OrderIdParamSchema },
	{ method: "patch", path: "/orders/me/:id/cancel", tag: "Orders", summary: "Huỷ 1 đơn hàng của mình", auth: true, permission: "order:create", schema: OrderIdParamSchema },
	{ method: "get", path: "/orders/admin", tag: "Orders", summary: "[Admin] Danh sách toàn bộ đơn hàng", auth: true, permission: "order:update", schema: ListOrdersAdminQuerySchema },
	{ method: "get", path: "/orders/admin/:id", tag: "Orders", summary: "[Admin] Chi tiết 1 đơn hàng bất kỳ", auth: true, permission: "order:update", schema: OrderIdParamSchema },
	{ method: "patch", path: "/orders/admin/:id/status", tag: "Orders", summary: "[Admin] Cập nhật trạng thái đơn hàng", auth: true, permission: "order:update", schema: UpdateOrderStatusSchema },

	// ── Payments ─────────────────────────────────────────────────────────
	{ method: "get", path: "/payments/vnpay/return", tag: "Payments", summary: "VNPay redirect người dùng về sau khi thanh toán (không cần auth)" },
	{ method: "get", path: "/payments/vnpay/ipn", tag: "Payments", summary: "VNPay IPN — xác nhận thanh toán phía server (không cần auth)" },
	{ method: "post", path: "/payments/zalopay/callback", tag: "Payments", summary: "ZaloPay callback xác nhận thanh toán (không cần auth)" },
	{ method: "get", path: "/payments/me/:orderId", tag: "Payments", summary: "Xem trạng thái thanh toán 1 đơn của mình", auth: true, permission: "order:read", schema: OwnPaymentParamSchema },
	{ method: "post", path: "/payments/me/:orderId/confirm", tag: "Payments", summary: "Xác nhận đã thanh toán COD/thủ công", auth: true, permission: "order:create", schema: ConfirmOwnPaymentSchema },
	{ method: "post", path: "/payments/me/:orderId/pay", tag: "Payments", summary: "Khởi tạo phiên thanh toán online (VNPay/ZaloPay) cho 1 đơn", auth: true, permission: "order:create", schema: OwnPaymentParamSchema },
	{ method: "get", path: "/payments/admin", tag: "Payments", summary: "[Admin] Danh sách toàn bộ thanh toán", auth: true, permission: "payment:read", schema: ListPaymentsAdminQuerySchema },
	{ method: "get", path: "/payments/admin/:id", tag: "Payments", summary: "[Admin] Chi tiết 1 thanh toán", auth: true, permission: "payment:read", schema: PaymentIdParamSchema },
	{ method: "patch", path: "/payments/admin/:id/status", tag: "Payments", summary: "[Admin] Cập nhật trạng thái thanh toán thủ công", auth: true, permission: "payment:manage", schema: UpdatePaymentStatusSchema },

	// ── Dashboard ────────────────────────────────────────────────────────
	{ method: "get", path: "/dashboard/overview", tag: "Dashboard", summary: "[Admin] Số liệu tổng quan", auth: true, permission: "dashboard:read" },
	{ method: "get", path: "/dashboard/revenue", tag: "Dashboard", summary: "[Admin] Chuỗi số liệu doanh thu theo thời gian", auth: true, permission: "dashboard:read", schema: RevenueSeriesQuerySchema },
	{ method: "get", path: "/dashboard/top-products", tag: "Dashboard", summary: "[Admin] Top sản phẩm bán chạy", auth: true, permission: "dashboard:read", schema: TopProductsQuerySchema },
	{ method: "get", path: "/dashboard/recent-orders", tag: "Dashboard", summary: "[Admin] Đơn hàng gần đây", auth: true, permission: "dashboard:read", schema: RecentOrdersQuerySchema },
	{ method: "get", path: "/dashboard/low-stock", tag: "Dashboard", summary: "[Admin] Sản phẩm sắp hết hàng", auth: true, permission: "dashboard:read", schema: LowStockQuerySchema },

	// ── Notifications ────────────────────────────────────────────────────
	{ method: "get", path: "/notifications", tag: "Notifications", summary: "Danh sách thông báo của chính mình", auth: true, schema: ListOwnNotificationsQuerySchema },
	{ method: "patch", path: "/notifications/read-all", tag: "Notifications", summary: "Đánh dấu đã đọc toàn bộ thông báo của mình", auth: true },
	{ method: "patch", path: "/notifications/:id/read", tag: "Notifications", summary: "Đánh dấu đã đọc 1 thông báo", auth: true, schema: NotificationIdParamSchema },
	{ method: "delete", path: "/notifications/read", tag: "Notifications", summary: "Xoá toàn bộ thông báo đã đọc của mình", auth: true },
	{ method: "delete", path: "/notifications/:id", tag: "Notifications", summary: "Xoá 1 thông báo của mình", auth: true, schema: NotificationIdParamSchema },
	{ method: "post", path: "/notifications/broadcast", tag: "Notifications", summary: "[Admin] Gửi thông báo hệ thống/khuyến mãi tới toàn bộ khách hàng", auth: true, permission: "notification:broadcast", schema: BroadcastNotificationSchema },

	// ── Uploads ──────────────────────────────────────────────────────────
	{ method: "post", path: "/uploads/product-image", tag: "Uploads", summary: "[Admin] Upload ảnh sản phẩm (multipart/form-data, field \"image\")", auth: true, permission: "catalog:write" },

	// ── External · GHN ───────────────────────────────────────────────────
	{ method: "get", path: "/external/ghn/provinces", tag: "External · GHN", summary: "Danh sách tỉnh/thành GHN", auth: true },
	{ method: "get", path: "/external/ghn/districts", tag: "External · GHN", summary: "Danh sách quận/huyện theo tỉnh", auth: true, schema: DistrictSchema },
	{ method: "get", path: "/external/ghn/wards", tag: "External · GHN", summary: "Danh sách phường/xã theo quận/huyện", auth: true, schema: WardSchema },
];
