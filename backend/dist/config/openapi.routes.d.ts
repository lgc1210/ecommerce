import type { ZodObject } from "zod";
export interface RouteMeta {
    method: "get" | "post" | "patch" | "delete";
    /** Đường dẫn TÍNH TỪ SAU "/api" (không lặp lại tiền tố /api ở đây), theo cú pháp Express (":id"). */
    path: string;
    tag: string;
    summary: string;
    /** true = bắt buộc đăng nhập, "optional" = không bắt buộc nhưng có gắn userId nếu có cookie hợp lệ. */
    auth?: boolean | "optional";
    /** resource:action theo hệ RBAC — undefined nếu route không qua requirePermission. */
    permission?: string;
    /** Schema dạng z.object({ body?, query?, params? }) — đúng schema dùng trong middleware validate(). */
    schema?: ZodObject<any>;
}
export declare const routeManifest: RouteMeta[];
//# sourceMappingURL=openapi.routes.d.ts.map