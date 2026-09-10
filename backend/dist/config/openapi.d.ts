/**
 * Sinh document OpenAPI 3.0 từ `routeManifest` — mỗi route tham chiếu lại đúng
 * Zod schema `z.object({ body?, query?, params? })` đang dùng thật trong middleware `validate()`,
 * nên tài liệu này luôn khớp với validation thật, không cần đồng bộ tay.
 */
export declare function buildOpenApiDocument(): {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
        description: string;
    }[];
    components: {
        securitySchemes: {
            cookieAuth: {
                type: string;
                in: string;
                name: string;
                description: string;
            };
        };
    };
    tags: {
        name: string;
    }[];
    paths: Record<string, Record<string, unknown>>;
};
//# sourceMappingURL=openapi.d.ts.map