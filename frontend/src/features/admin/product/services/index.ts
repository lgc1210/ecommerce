import apiClient from "../../../../configs/apis";
import type {
	AddSkuImagePayload,
	CreateProductPayload,
	CreateSkuPayload,
	DeleteSkuImagePayload,
	DeleteSkuPayload,
	ListProductsParams,
	UpdateProductPayload,
	UpdateSkuImagePayload,
	UpdateSkuPayload,
	UpdateSkuStockPayload,
} from "../types";

const productService = {
	// ---- Upload ảnh từ máy (dùng chung cho thumbnail sản phẩm + ảnh biến thể) ----
	uploadImage: (file: File) => {
		const formData = new FormData();
		formData.append("image", file);
		// QUAN TRỌNG: apiClient set sẵn Content-Type mặc định là "application/json" ở cấp
		// instance. Nếu không override ở đây, axios sẽ tưởng ta cố tình muốn gửi JSON và tự
		// JSON.stringify() cái FormData này trước khi gửi (File không có thuộc tính nào để
		// serialize -> thành "{}") thay vì gửi đúng dạng multipart/form-data kèm binary.
		// Set rõ "multipart/form-data" ở đây để axios giữ nguyên FormData; trình duyệt sẽ tự
		// thêm boundary chính xác khi thực sự gửi request (không tự tay set boundary).
		return apiClient.post("/uploads/product-image", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
	},

	// ---- Product ----
	getProducts: (params: ListProductsParams = {}) =>
		apiClient.get("/products/admin", {
			params: {
				page: params.page,
				limit: params.limit,
				search: params.search || undefined,
				categoryId: params.categoryId,
				minPrice: params.minPrice,
				maxPrice: params.maxPrice,
				sort: params.sort,
				isActive: params.isActive === undefined ? undefined : String(params.isActive),
			},
		}),
	getProductById: (id: number) => apiClient.get(`/products/id/${id}`),
	createProduct: (payload: CreateProductPayload) => apiClient.post("/products", payload),
	updateProduct: ({ id, ...payload }: UpdateProductPayload) => apiClient.patch(`/products/id/${id}`, payload),
	deleteProduct: (id: number) => apiClient.delete(`/products/id/${id}`),

	// ---- SKU (biến thể) ----
	createSku: ({ productId, ...payload }: CreateSkuPayload) => apiClient.post(`/products/id/${productId}/skus`, payload),
	updateSku: ({ productId, skuId, ...payload }: UpdateSkuPayload) =>
		apiClient.patch(`/products/id/${productId}/skus/${skuId}`, payload),
	updateSkuStock: ({ productId, skuId, stockQuantity }: UpdateSkuStockPayload) =>
		apiClient.patch(`/products/id/${productId}/skus/${skuId}/stock`, { stockQuantity }),
	deleteSku: ({ productId, skuId }: DeleteSkuPayload) => apiClient.delete(`/products/id/${productId}/skus/${skuId}`),

	// ---- Ảnh theo SKU ----
	addSkuImage: ({ productId, skuId, ...payload }: AddSkuImagePayload) =>
		apiClient.post(`/products/id/${productId}/skus/${skuId}/images`, payload),
	updateSkuImage: ({ productId, skuId, imageId, ...payload }: UpdateSkuImagePayload) =>
		apiClient.patch(`/products/id/${productId}/skus/${skuId}/images/${imageId}`, payload),
	deleteSkuImage: ({ productId, skuId, imageId }: DeleteSkuImagePayload) =>
		apiClient.delete(`/products/id/${productId}/skus/${skuId}/images/${imageId}`),
};

export default productService;
