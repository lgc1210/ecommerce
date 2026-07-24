import nodemailer from "nodemailer";
import { env } from "./dotenv.js";

// Destructure or invoke transport generation handlers cleanly
const transporter = nodemailer.createTransport({
	host: env.SMTP_HOST,
	port: env.SMTP_PORT,
	secure: env.SMTP_SECURE,
	auth: {
		user: env.SMTP_USER,
		pass: env.SMTP_PASS,
	},
});

export default transporter;
