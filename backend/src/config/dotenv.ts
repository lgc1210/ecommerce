import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

// Handle ES module directory paths safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix: Read the variable directly from process.env (injected by cross-env)
const envFileTarget = `.env.${process.env.NODE_ENV}`;

// 1. Explicitly locate and load the correct target .env file
dotenv.config({ path: path.resolve(__dirname, `../../${envFileTarget}`) });

// 2. Define a strict structural schema for your environment variables
const envSchema = z.object({
	PORT: z
		.string()
		.default("5000") // Fix: Must be a string template default before transformation
		.transform((val) => parseInt(val, 10)),
	NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	CLIENT_URL: z.url({ message: "CLIENT_URL must be a valid connection string format." }),
	DATABASE_URL: z.url({ message: "DATABASE_URL must be a valid connection string format." }),
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
	SMTP_HOST: z.string(),
	SMTP_PORT: z.string().transform((val) => parseInt(val, 10)),
	SMTP_SECURE: z.string().transform((val) => val === "true"), // Expects "true" string in .env
	SMTP_USER: z.email(),
	SMTP_PASS: z.string(),
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
