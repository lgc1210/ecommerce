import { env } from "./src/config/dotenv.js";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: env.DATABASE_URL,
	},
});
