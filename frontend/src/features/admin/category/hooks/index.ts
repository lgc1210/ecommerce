import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import categoryService from "../services";
import type { CategoryTreeNode, CreateCategoryPayload, UpdateCategoryPayload } from "../types";
import { getApiErrorMessage } from "../../../../utils/api";

export const ADMIN_CATEGORIES_QUERY_KEY = ["admin", "categories"] as const;

/**
 * Cây danh mục đầy đủ (tree=true), dùng cho cả bảng cây lẫn dropdown chọn danh
 * mục cha trong form tạo/sửa — 1 query key duy nhất, tránh gọi API 2 lần cho
 * cùng 1 dữ liệu.
 */
export const useCategoryTreeQuery = (search?: string) => {
	return useQuery<CategoryTreeNode[]>({
		queryKey: [...ADMIN_CATEGORIES_QUERY_KEY, "tree", search],
		queryFn: async () => {
			const res = await categoryService.getCategoryTree(search);
			return res.data.data;
		},
		placeholderData: keepPreviousData,
	});
};

export const useCreateCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateCategoryPayload) => categoryService.createCategory(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
			toast.success(res.data.message ?? "Tạo danh mục thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Tạo danh mục thất bại."));
		},
	});
};

export const useUpdateCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: UpdateCategoryPayload) => categoryService.updateCategory(payload),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
			toast.success(res.data.message ?? "Cập nhật danh mục thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Cập nhật danh mục thất bại."));
		},
	});
};

/**
 * Backend chặn xóa nếu danh mục còn danh mục con hoặc còn sản phẩm (409 Conflict,
 * xem category.service.ts:deleteCategory) — message lỗi đó được show thẳng qua
 * toast, không cần FE tự đoán trước điều kiện này.
 */
export const useDeleteCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => categoryService.deleteCategory(id),
		onSuccess: (res) => {
			queryClient.invalidateQueries({ queryKey: ADMIN_CATEGORIES_QUERY_KEY });
			toast.success(res.data.message ?? "Xóa danh mục thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Xóa danh mục thất bại."));
		},
	});
};
