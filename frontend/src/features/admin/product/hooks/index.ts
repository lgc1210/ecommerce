import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import productService from "../services";
import type {
	AddSkuImagePayload,
	AdminProductDetail,
	CreateProductPayload,
	CreateSkuPayload,
	DeleteSkuImagePayload,
	DeleteSkuPayload,
	ListProductsParams,
	ListProductsResult,
	UpdateProductPayload,
	UpdateSkuImagePayload,
	UpdateSkuPayload,
	UpdateSkuStockPayload,
	UploadImageResult,
} from "../types";
import { getApiErrorMessage } from "../../../../utils/api";

export const ADMIN_PRODUCTS_QUERY_KEY = ["admin", "products"] as const;

// ==========================================
// Upload ảnh từ máy
// ==========================================
/** Không invalidate query nào — chỉ trả URL, việc lưu URL đó vào product/SKU nào là do component gọi tiếp theo. */
export const useUploadImage = () => {
	return useMutation({
		mutationFn: async (file: File) => {
			const res = await productService.uploadImage(file);
			return res.data.data as UploadImageResult;
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Tải ảnh lên thất bại.")),
	});
};

export const useProductsQuery = (params: ListProductsParams) => {
	return useQuery<ListProductsResult>({
		queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, "list", params],
		queryFn: async () => {
			const res = await productService.getProducts(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

export const useProductQuery = (id: number) => {
	return useQuery<AdminProductDetail>({
		queryKey: [...ADMIN_PRODUCTS_QUERY_KEY, "detail", id],
		queryFn: async () => {
			const res = await productService.getProductById(id);
			return res.data.data;
		},
		enabled: Number.isFinite(id) && id > 0,
	});
};

/** Invalidate cả list lẫn mọi query chi tiết (prefix match), dùng sau bất kỳ thao tác ghi nào ảnh hưởng tới product/SKU/ảnh. */
const invalidateProducts = (queryClient: ReturnType<typeof useQueryClient>) =>
	queryClient.invalidateQueries({ queryKey: ADMIN_PRODUCTS_QUERY_KEY });

// ==========================================
// Product
// ==========================================
export const useCreateProduct = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateProductPayload) => productService.createProduct(payload),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Tạo sản phẩm thành công.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Tạo sản phẩm thất bại.")),
	});
};

export const useUpdateProduct = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateProductPayload) => productService.updateProduct(payload),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Cập nhật sản phẩm thành công.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Cập nhật sản phẩm thất bại.")),
	});
};

/** Backend chặn xóa (409) nếu sản phẩm đã có review, hoặc có SKU đang nằm trong giỏ hàng/đơn hàng — gợi ý vô hiệu hóa thay vì xóa. */
export const useDeleteProduct = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: number) => productService.deleteProduct(id),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Xóa sản phẩm thành công.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Xóa sản phẩm thất bại.")),
	});
};

// ==========================================
// SKU (biến thể)
// ==========================================
export const useCreateSku = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: CreateSkuPayload) => productService.createSku(payload),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Tạo biến thể thành công.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Tạo biến thể thất bại.")),
	});
};

export const useUpdateSku = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateSkuPayload) => productService.updateSku(payload),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Cập nhật biến thể thành công.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Cập nhật biến thể thất bại.")),
	});
};

export const useUpdateSkuStock = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateSkuStockPayload) => productService.updateSkuStock(payload),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Cập nhật tồn kho thành công.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Cập nhật tồn kho thất bại.")),
	});
};

/** Backend chặn xóa (409) nếu SKU đang nằm trong giỏ hàng/đơn hàng. */
export const useDeleteSku = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: DeleteSkuPayload) => productService.deleteSku(payload),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Xóa biến thể thành công.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Xóa biến thể thất bại.")),
	});
};

// ==========================================
// Ảnh theo SKU
// ==========================================
export const useAddSkuImage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: AddSkuImagePayload) => productService.addSkuImage(payload),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Đã thêm ảnh.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Thêm ảnh thất bại.")),
	});
};

export const useUpdateSkuImage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: UpdateSkuImagePayload) => productService.updateSkuImage(payload),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Cập nhật ảnh thành công.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Cập nhật ảnh thất bại.")),
	});
};

export const useDeleteSkuImage = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: DeleteSkuImagePayload) => productService.deleteSkuImage(payload),
		onSuccess: (res) => {
			invalidateProducts(queryClient);
			toast.success(res.data.message ?? "Đã xóa ảnh.");
		},
		onError: (error) => toast.error(getApiErrorMessage(error, "Xóa ảnh thất bại.")),
	});
};
