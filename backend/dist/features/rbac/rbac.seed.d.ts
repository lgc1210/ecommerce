export declare const roleSeed: () => Promise<void>;
export declare const permissionSeed: () => Promise<void>;
/**
 * Gán permission mặc định cho từng role (admin/manager/customer).
 * Phải chạy SAU roleSeed() và permissionSeed(). Chỉ chạy khi bảng role_permissions hoàn toàn trống,
 * để không ghi đè phân quyền đã được admin tùy chỉnh thủ công qua API rbac:manage.
 */
export declare const rolePermissionSeed: () => Promise<void>;
//# sourceMappingURL=rbac.seed.d.ts.map