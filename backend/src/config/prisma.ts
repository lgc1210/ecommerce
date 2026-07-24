import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import pkg from "../generated/prisma/index.js";
import { env } from "./dotenv.js";

const { PrismaClient } = pkg;

// @prisma/adapter-mariadb uses the `mariadb` driver internally (NOT mysql2).
// It builds its own pool from a config object or connection string — it does
// NOT accept an already-created pool instance (e.g. from mysql2.createPool()).
// Passing a mysql2 Pool here silently produces a broken config, which is why
// the pool could never actually acquire a connection (pool timeout, active=0).
const adapter = new PrismaMariaDb(env.DATABASE_URL);

// 3. Pass the adapter straight into your primary Prisma Client constructor configuration
const prisma = new PrismaClient({
	adapter,
	log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export default prisma;
