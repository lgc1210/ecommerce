import express, { type Application, type Response } from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import authRouter from "./features/auth/auth.routes.js";
import rbacRouter from "./features/rbac/rbac.routes.js";
import userRouter from "./features/users/user.routes.js";
import userAddressRouter from "./features/user_addresses/user_address.routes.js";
import categoryRouter from "./features/categories/category.routes.js";
import productRouter from "./features/products/product.routes.js";
import couponRouter from "./features/coupons/coupon.routes.js";
import reviewRouter from "./features/reviews/review.routes.js";
import cartRouter from "./features/carts/cart.routes.js";
import contactRouter from "./features/contacts/contact.routes.js";
import orderRouter from "./features/orders/order.routes.js";
import paymentRouter from "./features/payments/payment.routes.js";
import uploadRouter from "./features/uploads/upload.routes.js";
import dashboardRouter from "./features/dashboard/dashboard.routes.js";
import notificationRouter from "./features/notifications/notification.routes.js";

import ghnRouter from "./external/ghn/ghn.routes.js";

import { env } from "./config/dotenv.js";
import { UPLOAD_ROOT } from "./features/uploads/upload.middleware.js";
import { buildOpenApiDocument } from "./config/openapi.js";

const app: Application = express();

app.use(helmet()); // by default same-orign
app.use(
	cors({
		origin: env.CLIENT_URL,
		credentials: true,
	}),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

// File tĩnh (ảnh đã upload) — helmet mặc định set Cross-Origin-Resource-Policy: same-origin,
// sẽ khiến trình duyệt chặn <img> load ảnh từ frontend (khác origin với backend) nên phải nới
// riêng cho route này.
app.use(
	"/uploads",
	express.static(UPLOAD_ROOT, {
		setHeaders: (res: Response) => {
			res.set("Cross-Origin-Resource-Policy", "same-site");
		},
	}),
);

// Routes Mount Points
app.use("/api/auth", authRouter);
app.use("/api/rbac", rbacRouter);
app.use("/api/users", userRouter);
app.use("/api/addresses", userAddressRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/coupons", couponRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/uploads", uploadRouter); //

app.use("/api/external/ghn", ghnRouter);

// API Docs (Swagger UI) — sinh tự động từ Zod schema, xem src/config/openapi.ts.
// Chỉ bật ở development để tránh lộ chi tiết toàn bộ API ra production.
if (process.env.NODE_ENV !== "production") {
	const openApiDocument = buildOpenApiDocument();

	app.get("/api/docs.json", (_req, res: Response) => {
		res.json(openApiDocument);
	});
	app.use(
		"/api/docs",
		swaggerUi.serve,
		swaggerUi.setup(openApiDocument, {
			customSiteTitle: "Ecommerce Platform API Docs",
		}),
	);
}

export default app;
