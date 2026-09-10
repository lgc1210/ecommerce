/** Loại bỏ passwordHash khỏi object user trước khi trả về client */
export function sanitizeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}
//# sourceMappingURL=user.utils.js.map