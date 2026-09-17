import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import warrantyClaimService from "../services";
import { getApiErrorMessage } from "../../../../utils/api";
import type {
	CreateWarrantyClaimPayload,
	ListMyWarrantyClaimsParams,
	ListMyWarrantyClaimsResult,
	MyWarrantyClaimDetail,
	UploadClaimImageResult,
	WarrantableOrderItem,
} from "../types";

export const WARRANTABLE_ITEMS_QUERY_KEY = ["client", "warranty-claims", "warrantable-items"] as const;
export const MY_WARRANTY_CLAIMS_QUERY_KEY = ["client", "warranty-claims", "me"] as const;

/** Sản phẩm đã mua, đã giao, còn trong hạn bảo hành — dùng để hiện nút "Gửi yêu cầu bảo hành". */
export const useWarrantableOrderItemsQuery = () => {
	return useQuery<WarrantableOrderItem[]>({
		queryKey: WARRANTABLE_ITEMS_QUERY_KEY,
		queryFn: async () => {
			const res = await warrantyClaimService.getWarrantableOrderItems();
			return res.data.data;
		},
	});
};

/** Claim CHÍNH user hiện tại đã gửi — dùng cho tab "Bảo hành của tôi". */
export const useMyWarrantyClaimsQuery = (params: ListMyWarrantyClaimsParams) => {
	return useQuery<ListMyWarrantyClaimsResult>({
		queryKey: [...MY_WARRANTY_CLAIMS_QUERY_KEY, params],
		queryFn: async () => {
			const res = await warrantyClaimService.getMyWarrantyClaims(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

export const useMyWarrantyClaimDetailQuery = (id: number | null) => {
	return useQuery<{ data: MyWarrantyClaimDetail }>({
		queryKey: [...MY_WARRANTY_CLAIMS_QUERY_KEY, "detail", id],
		queryFn: async () => {
			const res = await warrantyClaimService.getMyWarrantyClaimById(id!);
			return res.data;
		},
		enabled: id !== null,
	});
};

/** Sau khi tạo/hủy claim, sản phẩm liên quan không biến mất khỏi "warrantable-items" (khách có thể
 * gửi nhiều claim cho cùng 1 sản phẩm), nhưng danh sách "Bảo hành của tôi" luôn cần invalidate. */
const invalidateWarrantyClaimQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
	queryClient.invalidateQueries({ queryKey: MY_WARRANTY_CLAIMS_QUERY_KEY });
};

export const useCreateWarrantyClaim = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateWarrantyClaimPayload) => warrantyClaimService.createWarrantyClaim(payload),
		onSuccess: (res) => {
			invalidateWarrantyClaimQueries(queryClient);
			toast.success(res.data.message ?? "Gửi yêu cầu bảo hành thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Gửi yêu cầu bảo hành thất bại, vui lòng thử lại."));
		},
	});
};

export const useCancelWarrantyClaim = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => warrantyClaimService.cancelMyWarrantyClaim(id),
		onSuccess: (res) => {
			invalidateWarrantyClaimQueries(queryClient);
			toast.success(res.data.message ?? "Đã hủy yêu cầu bảo hành.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Hủy yêu cầu bảo hành thất bại."));
		},
	});
};

/** Không toast lỗi ở đây — form gọi trực tiếp qua mutateAsync trong vòng lặp upload nhiều ảnh, để
 * tự gom lỗi và hiển thị theo đúng file nào thất bại (xem warranty-claim-form-modal.tsx). */
export const useUploadClaimImage = () => {
	return useMutation({
		mutationFn: async (file: File) => {
			const res = await warrantyClaimService.uploadClaimImage(file);
			return res.data.data as UploadClaimImageResult;
		},
	});
};
