import { z, type ZodObject } from "zod";

import { routeManifest } from "./openapi.routes.js";

/** Chuyển path kiểu Express (":id") sang path kiểu OpenAPI ("{id}"). */
function toOpenApiPath(expressPath: string): string {
	return expressPath.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

/** JSON Schema (chuẩn OpenAPI 3.0) sinh trực tiếp từ 1 nhánh Zod, giữ nguyên hình dạng
 *  input (trước khi coerce/default áp dụng) để khớp với những gì client thực sự gửi lên. */
function toRequestJsonSchema(schema: z.ZodTypeAny) {
	return z.toJSONSchema(schema, { target: "openapi-3.0", io: "input" });
}

/** Biến 1 ZodObject (query hoặc params) thành mảng OpenAPI `parameters`. */
function buildParameters(shape: ZodObject<any> | undefined, location: "query" | "path") {
	if (!shape) return [];

	const jsonSchema = toRequestJsonSchema(shape) as {
		properties?: Record<string, unknown>;
		required?: string[];
	};
	const required = jsonSchema.required ?? [];
	const properties = jsonSchema.properties ?? {};

	return Object.entries(properties).map(([name, propertySchema]) => ({
		name,
		in: location,
		// Mọi path param trong Express đều bắt buộc (không có ":id?" trong route nào ở đây).
		required: location === "path" ? true : required.includes(name),
		schema: propertySchema,
	}));
}

/**
 * Sinh document OpenAPI 3.0 từ `routeManifest` — mỗi route tham chiếu lại đúng
 * Zod schema `z.object({ body?, query?, params? })` đang dùng thật trong middleware `validate()`,
 * nên tài liệu này luôn khớp với validation thật, không cần đồng bộ tay.
 */
export function buildOpenApiDocument() {
	const paths: Record<string, Record<string, unknown>> = {};

	for (const route of routeManifest) {
		const bodyShape = route.schema?.shape?.body as ZodObject<any> | undefined;
		const queryShape = route.schema?.shape?.query as ZodObject<any> | undefined;
		const paramsShape = route.schema?.shape?.params as ZodObject<any> | undefined;

		const parameters = [...buildParameters(paramsShape, "path"), ...buildParameters(queryShape, "query")];

		const responses: Record<string, { description: string }> = {
			"200": { description: "Thành công" },
		};
		if (bodyShape || queryShape || paramsShape) {
			responses["400"] = { description: "Dữ liệu gửi lên không hợp lệ (Zod validation)" };
		}
		if (route.auth === true) {
			responses["401"] = { description: "Chưa đăng nhập hoặc token không hợp lệ/hết hạn" };
		}
		if (route.permission) {
			responses["403"] = { description: `Đã đăng nhập nhưng thiếu quyền "${route.permission}"` };
		}

		const operation: Record<string, unknown> = {
			tags: [route.tag],
			summary: route.summary,
			...(parameters.length ? { parameters } : {}),
			...(bodyShape
				? {
						requestBody: {
							required: true,
							content: { "application/json": { schema: toRequestJsonSchema(bodyShape) } },
						},
					}
				: {}),
			responses,
		};

		if (route.auth === true) operation.security = [{ cookieAuth: [] }];
		if (route.auth === "optional") {
			operation.description = "Không bắt buộc đăng nhập — nếu request có cookie accessToken hợp lệ, hệ thống sẽ tự gắn userId.";
		}
		if (route.permission) operation["x-required-permission"] = route.permission;

		const openApiPath = toOpenApiPath(route.path);
		paths[openApiPath] ??= {};
		paths[openApiPath][route.method] = operation;
	}

	const tags = [...new Set(routeManifest.map((route) => route.tag))].map((name) => ({ name }));

	return {
		openapi: "3.0.3",
		info: {
			title: "Ecommerce Platform API",
			version: "1.0.0",
			description: [
				"Tài liệu API được **sinh tự động** từ các Zod schema đã có sẵn trong `*.validation.ts` của từng feature",
				"(xem `src/config/openapi.routes.ts`) — không phải viết tay, nên luôn khớp với validation thật đang chạy.",
				"",
				"**Xác thực**: đăng nhập qua `POST /auth/login` trả về access token trong cookie `httpOnly` tên `accessToken`.",
				'Swagger UI không tự đính kèm cookie khi bấm "Try it out" theo kiểu cross-site, nên để thử trọn vẹn các route',
				"yêu cầu đăng nhập, hãy import `/api/docs.json` vào Postman (Postman xử lý cookie session tốt hơn) rồi login trước.",
			].join("\n"),
		},
		servers: [{ url: "/api", description: "Backend API" }],
		components: {
			securitySchemes: {
				cookieAuth: {
					type: "apiKey",
					in: "cookie",
					name: "accessToken",
					description: "JWT access token, cookie httpOnly được set khi gọi POST /auth/login (hoặc /auth/refresh-token).",
				},
			},
		},
		tags,
		paths,
	};
}
