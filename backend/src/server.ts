import { env } from "./config/dotenv.js";
import app from "./app.js";
import prisma from "./config/prisma.js";
import { permissionSeed, rolePermissionSeed, roleSeed } from "./features/rbac/rbac.seed.js";
import { userAddressSeed } from "./features/user_addresses/user_address.seed.js";
import { userSeed } from "./features/users/user.seed.js";
import { productSeed } from "./features/products/product.seed.js";
import { couponSeed } from "./features/coupons/coupon.seed.js";
import { reviewSeed } from "./features/reviews/review.seed.js";
import { contactSeed } from "./features/contacts/contact.seed.js";
import { orderSeed } from "./features/orders/order.seed.js";

async function bootstrap(): Promise<void> {
	try {
		// 1. Assert database connection integrity before opening network channels
		await prisma.$connect();
		console.log("Database Connection: Successfully instantiated connection pool link with MySQL via Prisma Client.");

		// 2. Seed the database with system roles and permissions
		await roleSeed();
		await permissionSeed();
		await rolePermissionSeed();
		await userSeed();
		await userAddressSeed();
		await productSeed();
		await orderSeed();
		await couponSeed();
		await reviewSeed();
		await contactSeed();

		// 2. Instantiate and mount active HTTP port listeners
		const server = app.listen(env.PORT, () => {
			console.log(`=======================================================`);
			console.log(`Server execution loop initialized successfully.`);
			console.log(`Network Listening Port: http://localhost:${env.PORT}`);
			console.log(`Active App Operating Mode: [${env.NODE_ENV.toUpperCase()}]`);
			console.log(`=======================================================`);
		});

		// 3. Graceful Shutdown handlers (Ensures database connections close cleanly if server stops)
		const handleSignal = async (signal: string) => {
			console.log(`\nReceived ${signal} signal. Initializing graceful termination steps...`);
			server.close(async () => {
				console.log("Express HTTP server channel disconnected.");
				await prisma.$disconnect();
				console.log("Prisma database connection pool drained safely.");
				process.exit(0);
			});
		};

		process.on("SIGTERM", () => handleSignal("SIGTERM"));
		process.on("SIGINT", () => handleSignal("SIGINT"));
	} catch (error) {
		console.error("CRITICAL ENGINE BOOT ERROR: Unable to successfully mount infrastructure components:");
		console.error(error);
		process.exit(1);
	}
}

// Fire up the execution ignition sequence
bootstrap();
