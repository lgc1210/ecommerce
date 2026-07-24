import apiClient from "../../../../configs/apis";
import type { CreateCategoryPayload, UpdateCategoryPayload } from "../types";

const categoryService = {
	/** Luôn gọi với tree=true: trang quản trị hiển thị cây phân cấp đầy đủ, không phân trang (xem category.service.ts:listCategories ở backend). */
	getCategoryTree: (search?: string) =>
		apiClient.get("/categories", { params: { tree: "true", search: search || undefined } }),
	createCategory: (payload: CreateCategoryPayload) => apiClient.post("/categories", payload),
	updateCategory: ({ id, ...payload }: UpdateCategoryPayload) => apiClient.patch(`/categories/id/${id}`, payload),
	deleteCategory: (id: number) => apiClient.delete(`/categories/id/${id}`),
};

export default categoryService;
