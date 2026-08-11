import { env } from "./dotenv.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import pkg from "../generated/prisma/index.js";
import path from "path";
import fs from "fs";

const { PrismaClient } = pkg;

const __dirname = import.meta.dirname;

// @prisma/adapter-mariadb uses the `mariadb` driver internally (NOT mysql2).
// It builds its own pool from a config object or connection string — it does
// NOT accept an already-created pool instance (e.g. from mysql2.createPool()).
// Passing a mysql2 Pool here silently produces a broken config, which is why
// the pool could never actually acquire a connection (pool timeout, active=0).
//
// SSL is OFF by default (local MySQL). It only turns on when env.DATABASE_SSL
// is "true" (set on Railway for Aiven) — this file never needs to change
// between local and production, only the .env values do.
const dbUrl = new URL(env.DATABASE_URL);
const adapter = new PrismaMariaDb({
	host: dbUrl.hostname,
	port: Number(dbUrl.port),
	user: decodeURIComponent(dbUrl.username),
	password: decodeURIComponent(dbUrl.password),
	database: dbUrl.pathname.replace(/^\//, ""),
	...(env.DATABASE_SSL
		? {
				ssl: {
					ca: fs.readFileSync(path.resolve(__dirname, "../../certs/aiven-ca.pem"), "utf8"),
				},
			}
		: {}),
});

// 3. Pass the adapter straight into your primary Prisma Client constructor configuration
const prisma = new PrismaClient({
	adapter,
	// log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export default prisma;
