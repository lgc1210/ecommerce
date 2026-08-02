import express, { type Application, type Response } from "express";

import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

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

import ghnRouter from "./external/ghn/ghn.routes.js";

import { env } from "./config/dotenv.js";
import { UPLOAD_ROOT } from "./features/uploads/upload.middleware.js";

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
app.use("/api/uploads", uploadRouter); //

app.use("/api/external/ghn", ghnRouter);

export default app;
