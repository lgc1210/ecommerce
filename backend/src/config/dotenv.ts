import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// Handle ES module directory paths safely
const __dirname = import.meta.dirname;

// Fix: Read the variable directly from process.env (injected by cross-env)
const envFileTarget = `.env.${process.env.NODE_ENV}`;

// 1. Explicitly locate and load the correct target .env file
dotenv.config({ path: path.resolve(__dirname, `../../${envFileTarget}`) });

// 2. Define a strict structural schema for your environment variables
const envSchema = z.object({
	ADMIN_PASSWORD: z.string().min(8, { message: "ADMIN_PASSWORD must be at least 8 characters long." }),
	CLIENT_URL: z.url({ message: "CLIENT_URL must be a valid connection string format." }),

	COOKIE_DOMAIN: z.string().optional(), // dùng khi mua domain riêng sau này, hiện để trống

	// Database
	// Bật SSL khi kết nối MySQL (bắt buộc với Aiven ở production). Không bắt buộc khai
	// báo — mặc định "false" nên MySQL local (dev) không cần cấu hình gì thêm. Đặt
	// "true" trong .env.production (hoặc biến môi trường trên Railway) để bật.
	DATABASE_URL: z.url({ message: "DATABASE_URL must be a valid connection string format." }),
	DATABASE_SSL: z
		.string()
		.optional()
		.default("false")
		.transform((val) => val === "true"),

	// Google OAuth Client ID (Web application), dùng để xác thực idToken gửi lên từ
	// frontend qua google-auth-library. Phải trùng với client ID cấu hình ở frontend
	// (VITE_GOOGLE_CLIENT_ID), vì idToken được cấp cho đúng 1 client ID (audience).
	GOOGLE_CLIENT_ID: z.string().min(1, { message: "GOOGLE_CLIENT_ID is required for Google login." }),

	// Facebook App ID + App Secret, dùng để tạo App Access Token (APP_ID|APP_SECRET) gọi
	// Graph API "debug_token" xác minh accessToken do frontend gửi lên thực sự thuộc về
	// đúng app này (tương tự việc kiểm tra audience của idToken ở luồng Google).
	FACEBOOK_APP_ID: z.string().min(1, { message: "FACEBOOK_APP_ID is required for Facebook login." }),
	FACEBOOK_APP_SECRET: z.string().min(1, { message: "FACEBOOK_APP_SECRET is required for Facebook login." }),
	JWT_SECRET: z.string().min(8, { message: "JWT_SECRET must be at least 8 characters long." }),
	JWT_REFRESH_SECRET: z.string().min(8),

	// VNPay — xem https://sandbox.vnpayment.vn (tài khoản demo) để lấy TMN Code + Hash Secret
	VNP_TMNCODE: z.string().min(1, { message: "VNP_TMNCODE is required for VNPay." }),
	VNP_HASHSECRET: z.string().min(1, { message: "VNP_HASHSECRET is required for VNPay." }),
	// Gốc URL cổng thanh toán VNPay (sandbox: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html)
	VNP_URL: z.string().min(1, { message: "VNP_URL is required for VNPay." }),
	// URL BACKEND (không phải frontend) mà VNPay redirect trình duyệt khách về sau khi thanh toán —
	// backend cần tự verify chữ ký trước khi redirect tiếp sang trang kết quả ở frontend.
	VNP_RETURNURL: z.string().min(1, { message: "VNP_RETURNURL is required for VNPay." }),

	// ZaloPay — xem https://docs.zalopay.vn
	ZALOPAY_APP_ID: z.string().min(1, { message: "ZALOPAY_APP_ID is required for ZaloPay." }),
	ZALOPAY_KEY1: z.string().min(1, { message: "ZALOPAY_KEY1 is required for ZaloPay." }),
	ZALOPAY_KEY2: z.string().min(1, { message: "ZALOPAY_KEY2 is required for ZaloPay." }),
	// Gốc URL API ZaloPay (sandbox: https://sb-openapi.zalopay.vn)
	ZALOPAY_ENDPOINT: z.string().min(1, { message: "ZALOPAY_ENDPOINT is required for ZaloPay." }),
	// URL FRONTEND mà ZaloPay redirect trình duyệt khách về sau khi thanh toán (không kèm chữ ký
	// đáng tin cậy — chỉ dùng để hiển thị UI, KHÔNG dùng để cập nhật trạng thái đơn hàng).
	ZALOPAY_REDIRECT_URL: z.string().min(1, { message: "ZALOPAY_REDIRECT_URL is required for ZaloPay." }),
	// URL BACKEND công khai (server-to-server) để ZaloPay gọi callback xác nhận thanh toán —
	// PHẢI là URL truy cập được từ internet (dùng ngrok/tunnel khi phát triển local).
	ZALOPAY_CALLBACK_URL: z.string().min(1, { message: "ZALOPAY_CALLBACK_URL is required for ZaloPay." }),

	// Giao Hàng Nhanh
	GHN_API_TOKEN: z.string().min(1, { message: "GHN_API_TOKEN is required for Giao Hàng Nhanh." }),
	GHN_API_URL: z.string().min(1, { message: "GHN_API_URL is required for Giao Hàng Nhanh." }),
	GHN_SHOP_ID: z.string().min(1, { message: "GHN_SHOP_ID is required for Giao Hàng Nhanh." }),
	GHN_SERVICE_TYPE_ID: z.string().min(1, { message: "GHN_SERVICE_TYPE_ID is required for Giao Hàng Nhanh." }),
	GHN_FROM_DISTRICT_ID: z.string().min(1, { message: "GHN_FROM_DISTRICT_ID is required for Giao Hàng Nhanh." }),
	GHN_FROM_WARD_CODE: z.string().min(1, { message: "GHN_FROM_WARD_CODE is required for Giao Hàng Nhanh." }),

	// Brevo (gửi email qua HTTPS API — xem src/config/email.ts). Dùng HTTPS API (không phải SMTP
	// relay) vì nhiều nền tảng hosting (Railway, Render...) chặn outbound SMTP ở tầng network, gây
	// timeout ở production dù local dev chạy bình thường.
	BREVO_API_KEY: z.string().min(1, { message: "BREVO_API_KEY is required to send emails via Brevo." }),
	// Sender email PHẢI được verify trên Brevo trước (Senders & IP > Senders) — verify 1 email đơn lẻ
	// dễ hơn nhiều so với verify cả 1 domain (không bị giới hạn "chỉ gửi được cho chính mình" như
	// Resend ở gói miễn phí chưa verify domain).
	BREVO_SENDER_EMAIL: z.email({ message: "BREVO_SENDER_EMAIL must be a valid, verified sender email on Brevo." }),
	BREVO_SENDER_NAME: z.string().min(1, { message: "BREVO_SENDER_NAME is required to send emails via Brevo." }),

	// Dọn đơn "pending" thanh toán online quá hạn (khách bỏ ngang, không bao giờ thanh toán/thử
	// lại) — tự động hủy + hoàn tồn kho/lượt dùng coupon sau X giờ kể từ lúc đặt hàng. Không áp
	// dụng cho COD (COD không có khái niệm "hết hạn thanh toán online"). Có default nên không bắt
	// buộc khai báo trong .env.
	PENDING_ORDER_TTL_HOURS: z
		.string()
		.default("24")
		.transform((val) => parseInt(val, 10)),
	// Lịch chạy job dọn đơn quá hạn ở trên, dạng cron. Mặc định chạy mỗi giờ.
	PENDING_ORDER_CLEANUP_CRON: z.string().default("0 * * * *"),
});

// 3. Validate process.env variables against our Zod schema structural definition
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
	console.error("CRITICAL ERROR: Invalid configuration flags detected in your environment file:");
	console.error(JSON.stringify(parseResult.error.format(), null, 2));
	process.exit(1); // Stop execution immediately if keys are missing
}

// 4. Export the validated data type
export const env = parseResult.data;
