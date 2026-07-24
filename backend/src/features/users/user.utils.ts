/** Loại bỏ passwordHash khỏi object user trước khi trả về client */
export function sanitizeUser<T extends { passwordHash?: string | null }>(user: T): Omit<T, "passwordHash"> {
	const { passwordHash, ...safeUser } = user;
	return safeUser;
}
