/** Loại bỏ passwordHash khỏi object user trước khi trả về client */
export declare function sanitizeUser<T extends {
    passwordHash?: string | null;
}>(user: T): Omit<T, "passwordHash">;
//# sourceMappingURL=user.utils.d.ts.map