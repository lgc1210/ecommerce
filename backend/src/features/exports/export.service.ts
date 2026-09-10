import type { Response } from "express";
import prisma from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import type { ExportQuery, ExportResource } from "./export.validation.js";

const BATCH_SIZE = 500;
const MAX_ROWS = 100_000;

type Row = Record<string, unknown>;
type BatchReader = (cursor?: number) => Promise<Row[]>;

const csvValue = (value: unknown): string => {
	if (value === null || value === undefined) return "";
	const text = value instanceof Date ? value.toISOString() : typeof value === "object" ? JSON.stringify(value) : String(value);
	// Prevent formula injection when an export is opened in Excel/Sheets.
	const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
	return /[",\r\n]/.test(safeText) ? `"${safeText.replaceAll('"', '""')}"` : safeText;
};

const writeRows = async (res: Response, headers: string[], readBatch: BatchReader): Promise<void> => {
	res.write(`\uFEFF${headers.join(",")}\r\n`);
	let cursor: number | undefined;
	let written = 0;

	while (written < MAX_ROWS) {
		const rows = await readBatch(cursor);
		if (rows.length === 0) break;
		for (const row of rows) {
			res.write(`${headers.map((header) => csvValue(row[header])).join(",")}\r\n`);
			written++;
			if (written >= MAX_ROWS) break;
		}
		cursor = Number(rows[rows.length - 1]!.id);
		if (rows.length < BATCH_SIZE) break;
	}
};

const dateRange = (query: ExportQuery) => {
	if (!query.dateFrom && !query.dateTo) return undefined;
	return {
		...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
		...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
	};
};

const buildReader = (resource: ExportResource, query: ExportQuery): { filename: string; headers: string[]; readBatch: BatchReader } => {
	switch (resource) {
		case "users": {
			const where = {
				...(query.search ? { OR: [{ name: { contains: query.search } }, { email: { contains: query.search } }, { phone: { contains: query.search } }] } : {}),
				...(query.roleId ? { roleId: Number(query.roleId) } : {}),
				...(query.isActive ? { isActive: query.isActive === "true" } : {}),
			};
			const headers = ["id", "name", "email", "phone", "role", "provider", "isActive", "isVerified", "createdAt"];
			return {
				filename: "users.csv",
				headers,
				readBatch: async (cursor) => {
					const users = await prisma.user.findMany({
						where,
						take: BATCH_SIZE,
						...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
						orderBy: { id: "asc" },
						select: { id: true, name: true, email: true, phone: true, provider: true, isActive: true, isVerified: true, createdAt: true, role: { select: { name: true } } },
					});
					return users.map(({ role, ...user }) => ({ ...user, role: role.name }));
				},
			};
		}
		case "categories": {
			const where = query.search ? { name: { contains: query.search } } : {};
			const headers = ["id", "parentId", "name", "slug", "description", "isFeatured", "createdAt"];
			return {
				filename: "categories.csv",
				headers,
				readBatch: async (cursor) => prisma.category.findMany({ where, take: BATCH_SIZE, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: { id: "asc" }, select: { id: true, parentId: true, name: true, slug: true, description: true, isFeatured: true, createdAt: true } }),
			};
		}
		case "products": {
			const where = {
				...(query.search ? { name: { contains: query.search } } : {}),
				...(query.categoryId ? { categoryId: Number(query.categoryId) } : {}),
				...(query.isActive ? { isActive: query.isActive === "true" } : {}),
			};
			const headers = ["id", "name", "slug", "category", "sku", "price", "oldPrice", "stockQuantity", "variationDetails", "isActive", "isFeatured", "thumbnailUrl", "createdAt"];
			return {
				filename: "products.csv",
				headers,
				readBatch: async (cursor) => {
					const products = await prisma.product.findMany({
						where,
						take: BATCH_SIZE,
						...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
						orderBy: { id: "asc" },
						select: { id: true, name: true, slug: true, isActive: true, isFeatured: true, thumbnailUrl: true, createdAt: true, category: { select: { name: true } }, skus: { select: { sku: true, price: true, oldPrice: true, stockQuantity: true, variationDetails: true } } },
					});
					return products.flatMap((product) =>
						(product.skus.length ? product.skus : [null]).map((sku) => ({
							id: product.id,
							name: product.name,
							slug: product.slug,
							category: product.category?.name,
							sku: sku?.sku,
							price: sku?.price,
							oldPrice: sku?.oldPrice,
							stockQuantity: sku?.stockQuantity,
							variationDetails: sku?.variationDetails,
							isActive: product.isActive,
							isFeatured: product.isFeatured,
							thumbnailUrl: product.thumbnailUrl,
							createdAt: product.createdAt,
						})),
					);
				},
			};
		}
		case "coupons": {
			const where = {
				...(query.search ? { code: { contains: query.search.toUpperCase() } } : {}),
				...(query.isActive ? { isActive: query.isActive === "true" } : {}),
				...(query.discountType ? { discountType: query.discountType as never } : {}),
			};
			const headers = ["id", "code", "email", "discountType", "discountValue", "minOrderValue", "maxDiscountValue", "startsAt", "expiresAt", "usageLimit", "usedCount", "isActive"];
			return { filename: "coupons.csv", headers, readBatch: async (cursor) => prisma.coupon.findMany({ where, take: BATCH_SIZE, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: { id: "asc" }, select: { id: true, code: true, email: true, discountType: true, discountValue: true, minOrderValue: true, maxDiscountValue: true, startsAt: true, expiresAt: true, usageLimit: true, usedCount: true, isActive: true } }) };
		}
		case "reviews": {
			const where = {
				...(query.productId ? { productId: Number(query.productId) } : {}),
				...(query.userId ? { userId: Number(query.userId) } : {}),
				...(query.rating ? { rating: Number(query.rating) } : {}),
				...(query.isVisible ? { isVisible: query.isVisible === "true" } : {}),
				...(query.search ? { comment: { contains: query.search } } : {}),
			};
			const headers = ["id", "product", "user", "rating", "comment", "isVisible", "isRefundedTag", "createdAt"];
			return { filename: "reviews.csv", headers, readBatch: async (cursor) => (await prisma.review.findMany({ where, take: BATCH_SIZE, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: { id: "asc" }, select: { id: true, rating: true, comment: true, isVisible: true, isRefundedTag: true, createdAt: true, product: { select: { name: true } }, user: { select: { email: true } } } })).map(({ product, user, ...review }) => ({ ...review, product: product.name, user: user?.email })) };
		}
		case "contacts": {
			const where = {
				...(query.status ? { status: query.status as never } : {}),
				...(query.userId ? { userId: Number(query.userId) } : {}),
				...(query.search ? { OR: [{ name: { contains: query.search } }, { email: { contains: query.search } }, { subject: { contains: query.search } }] } : {}),
			};
			const headers = ["id", "userId", "name", "email", "subject", "message", "status", "createdAt", "updatedAt"];
			return { filename: "contacts.csv", headers, readBatch: async (cursor) => prisma.contact.findMany({ where, take: BATCH_SIZE, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: { id: "asc" }, select: { id: true, userId: true, name: true, email: true, subject: true, message: true, status: true, createdAt: true, updatedAt: true } }) };
		}
		case "orders": {
			const where = {
				...(query.status ? { orderStatus: query.status as never } : {}),
				...(query.userId ? { userId: Number(query.userId) } : {}),
				...(query.search ? { OR: [{ orderNumber: { contains: query.search } }, { user: { email: { contains: query.search } } }, { user: { name: { contains: query.search } } }] } : {}),
				...(dateRange(query) ? { createdAt: dateRange(query) } : {}),
			};
			const headers = ["id", "orderNumber", "customer", "email", "subtotalAmount", "discountAmount", "shippingFee", "totalAmount", "orderStatus", "paymentStatus", "paymentMethod", "createdAt", "deliveredAt"];
			return {
				filename: "orders.csv",
				headers,
				readBatch: async (cursor) => {
					const orders: Prisma.OrderGetPayload<{ include: { user: { select: { name: true; email: true } }; payment: { select: { paymentStatus: true; paymentMethod: true } } } }>[] =
						await prisma.order.findMany({ where: where as Prisma.OrderWhereInput, take: BATCH_SIZE, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: { id: "asc" }, include: { user: { select: { name: true, email: true } }, payment: { select: { paymentStatus: true, paymentMethod: true } } } });
					return orders.map(({ user, payment, ...order }) => ({ ...order, customer: user?.name, email: user?.email, paymentStatus: payment?.paymentStatus, paymentMethod: payment?.paymentMethod }));
				},
			};
		}
		case "payments": {
			const where = {
				...(query.status ? { paymentStatus: query.status as never } : {}),
				...(query.method ? { paymentMethod: query.method as never } : {}),
				...(query.search ? { order: { OR: [{ orderNumber: { contains: query.search } }, { user: { email: { contains: query.search } } }, { user: { name: { contains: query.search } } }] } } : {}),
				...(dateRange(query) ? { createdAt: dateRange(query) } : {}),
			};
			const headers = ["id", "orderNumber", "customer", "email", "paymentMethod", "paymentStatus", "amount", "transactionId", "paidAt", "createdAt"];
			return {
				filename: "payments.csv",
				headers,
				readBatch: async (cursor) => {
					const payments: Prisma.PaymentGetPayload<{ include: { order: { select: { orderNumber: true; user: { select: { name: true; email: true } } } } } }>[] =
						await prisma.payment.findMany({ where: where as Prisma.PaymentWhereInput, take: BATCH_SIZE, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), orderBy: { id: "asc" }, include: { order: { select: { orderNumber: true, user: { select: { name: true, email: true } } } } } });
					return payments.map(({ order, ...payment }) => ({ ...payment, orderNumber: order.orderNumber, customer: order.user?.name, email: order.user?.email }));
				},
			};
		}
	}
};

export const exportResource = async (resource: ExportResource, query: ExportQuery, res: Response): Promise<void> => {
	const { filename, headers, readBatch } = buildReader(resource, query);
	res.setHeader("Content-Type", "text/csv; charset=utf-8");
	res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
	await writeRows(res, headers, readBatch);
};
