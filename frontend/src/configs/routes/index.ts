import { createBrowserRouter, Outlet } from "react-router-dom";

// Client pages
import HomePage from "../../pages/client/home";
import AboutPage from "../../pages/client/about";
import ShopPage from "../../pages/client/shop";
import ContactPage from "../../pages/client/contact";
import ProductDetailPage from "../../pages/client/product-detail";
import CartPage from "../../pages/client/cart";
import PaymentPage from "../../pages/client/payment";
import LoginPage from "../../pages/auth/login";
import RegisterPage from "../../pages/auth/register";
import ForgotPasswordPage from "../../pages/auth/forgot-password";
import ResetPasswordPage from "../../pages/auth/reset-password";
import AccountPage from "../../pages/client/account";

// Error pages
import NotFoundPage from "../../pages/404";
import ForbiddenPage from "../../pages/403";

// Admin pages
import AdminDashboardPage from "../../pages/admin/dashboard";
import AdminProductPage from "../../pages/admin/product";
import AdminProductDetailPage from "../../pages/admin/product/detail";
import AdminUserPage from "../../pages/admin/user";
import AdminRbacPage from "../../pages/admin/rbac";
import AdminCategoryPage from "../../pages/admin/category";
import AdminCouponPage from "../../pages/admin/coupon";
import AdminOrderPage from "../../pages/admin/order";
import AdminPaymentPage from "../../pages/admin/payment";
import AdminContactPage from "../../pages/admin/contact";

// Layouts
import ClientLayout from "../../layouts/client";
import AdminLayout from "../../layouts/admin";
import VerifyOtpPage from "../../pages/auth/verify-otp";

// Loaders
import { guestOnlyLoader, requireAuthLoader } from "../../features/auth/loader";
import { requirePermissionLoader } from "../../middlewares/rbac";

// Middlewares
import permissions from "../constants/permissions";

// Paths
import paths from "../constants/paths";

const router = createBrowserRouter([
	// Home page
	// {
	// 	index: true,
	// 	Component: HomePage,
	// 	handle: {
	// 		title: "Trang chủ",
	// 		crumb: () => "Trang chủ",
	// 	},
	// },

	// Client layout
	{
		Component: ClientLayout,
		children: [
			{
				index: true,
				Component: HomePage,
				handle: {
					title: "Trang chủ",
					crumb: () => "Trang chủ",
				},
			},
			{
				path: "about",
				Component: AboutPage,
				handle: { title: "Giới thiệu", crumb: () => "Giới thiệu" },
			},
			{
				path: "shop",
				Component: ShopPage,
				handle: { title: "Cửa hàng", crumb: () => "Cửa hàng", preventScrollReset: true },
			},
			{
				// Route cha thuần logic (không path, không render gì thêm ngoài Outlet) — chỉ để
				// chèn "Cửa hàng" vào breadcrumb của trang chi tiết sản phẩm (Trang chủ > Cửa hàng >
				// <tên sản phẩm>), không ảnh hưởng đến URL (vẫn là /product/:slug, không phải
				// /shop/product/:slug).
				Component: Outlet,
				handle: { crumb: () => "Cửa hàng", crumbPath: paths.client.shop },
				children: [
					{
						path: "product/:slug",
						Component: ProductDetailPage,
						handle: { title: "Sản phẩm" },
					},
				],
			},
			{
				path: "contact",
				Component: ContactPage,
				handle: { title: "Liên hệ", crumb: () => "Liên hệ" },
			},
			{
				// Giỏ hàng KHÔNG gắn requireAuthLoader: khách chưa đăng nhập vẫn phải
				// xem/sửa được giỏ hàng (giỏ hàng sống ở zustand + localStorage, xem
				// features/client/cart/store).
				path: "cart",
				Component: CartPage,
				handle: { title: "Giỏ hàng", crumb: () => "Giỏ hàng" },
			},
			{
				// Thanh toán vẫn yêu cầu đăng nhập (giống hành vi route "order" cũ) vì
				// cần xác định người đặt hàng, dù màn hình thanh toán ở bước này mới
				// chỉ là giao diện mock, chưa gọi API thật.
				path: "payment",
				// loader: requireAuthLoader,
				Component: PaymentPage,
				handle: { title: "Thanh toán", crumb: () => "Thanh toán" },
			},
			{
				path: "account",
				loader: requireAuthLoader,
				Component: AccountPage,
				handle: { title: "Tài khoản của tôi", crumb: () => "Tài khoản của tôi" },
			},
			{
				path: "login",
				loader: guestOnlyLoader,
				Component: LoginPage,
				handle: { title: "Đăng nhập", crumb: () => "Đăng nhập" },
			},
			{
				path: "register",
				loader: guestOnlyLoader,
				Component: RegisterPage,
				handle: { title: "Đăng ký", crumb: () => "Đăng ký" },
			},
			{
				path: "forgot-password",
				loader: guestOnlyLoader,
				Component: ForgotPasswordPage,
				handle: { title: "Quên mật khẩu", crumb: () => "Quên mật khẩu" },
			},
			{
				path: "reset-password",
				loader: guestOnlyLoader,
				Component: ResetPasswordPage,
				handle: { title: "Khôi phục mật khẩu", crumb: () => "Khôi phục mật khẩu" },
			},
			{
				path: "verify-otp",
				loader: guestOnlyLoader,
				Component: VerifyOtpPage,
				handle: { title: "Xác thực OTP", crumb: () => "Xác thực OTP" },
			},
		],
	},

	// Admin layout
	{
		path: "admin",
		Component: AdminLayout,
		middleware: [],
		children: [
			{
				index: true,
				loader: requirePermissionLoader(permissions.dashboard.read),
				Component: AdminDashboardPage,
				handle: { title: "Dashboard", crumb: () => "Dashboard" },
			},
			{
				path: "dashboard",
				loader: requirePermissionLoader(permissions.dashboard.read),
				Component: AdminDashboardPage,
				handle: { title: "Dashboard", crumb: () => "Dashboard" },
			},
			{
				path: "product",
				loader: requirePermissionLoader(permissions.catalog.read),
				Component: AdminProductPage,
				handle: { title: "Product", crumb: () => "Product" },
			},
			{
				path: "product/:id",
				loader: requirePermissionLoader(permissions.catalog.read),
				Component: AdminProductDetailPage,
				handle: { title: "Chi tiết sản phẩm", crumb: () => "Chi tiết sản phẩm" },
			},
			{
				path: "user",
				loader: requirePermissionLoader(permissions.user.read),
				Component: AdminUserPage,
				handle: { title: "User", crumb: () => "User" },
			},
			{
				path: "role",
				loader: requirePermissionLoader(permissions.rbac.manage),
				Component: AdminRbacPage,
				handle: { title: "Role", crumb: () => "Role" },
			},
			{
				path: "category",
				loader: requirePermissionLoader(permissions.catalog.read),
				Component: AdminCategoryPage,
				handle: { title: "Category", crumb: () => "Category" },
			},
			{
				path: "coupon",
				loader: requirePermissionLoader(permissions.coupon.manage),
				Component: AdminCouponPage,
				handle: { title: "Coupon", crumb: () => "Coupon" },
			},
			{
				path: "order",
				loader: requirePermissionLoader(permissions.order.update),
				Component: AdminOrderPage,
				handle: { title: "Order", crumb: () => "Order" },
			},
			{
				path: "payment",
				loader: requirePermissionLoader(permissions.payment.read),
				Component: AdminPaymentPage,
				handle: { title: "Payment", crumb: () => "Payment" },
			},
			{
				path: "contact",
				loader: requirePermissionLoader(permissions.contact.manage),
				Component: AdminContactPage,
				handle: { title: "Contact", crumb: () => "Contact" },
			},
		],
	},

	// Forbidden (đã đăng nhập nhưng thiếu permission)
	{
		path: "403",
		Component: ForbiddenPage,
		handle: { title: "Forbidden", crumb: () => "403" },
	},

	// Not found page
	{
		path: "*",
		Component: NotFoundPage,
		handle: { title: "Not found", crumb: () => "404" },
	},
]);

export default router;
