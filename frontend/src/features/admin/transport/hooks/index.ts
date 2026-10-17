import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import transportService from "../services";
import type {
	GhnPrintSize,
	GhnShipmentDetail,
	ListShipmentsParams,
	ListShipmentsResult,
} from "../types";
import { getApiErrorMessage } from "../../../../utils/api";
import { ADMIN_ORDERS_QUERY_KEY } from "../../order/hooks";

export const ADMIN_TRANSPORT_QUERY_KEY = ["admin", "transport"] as const;

/** Danh sách đơn đã có vận đơn GHN (đọc từ DB, trạng thái do webhook GHN cập nhật), có phân trang/lọc. */
export const useShipmentsAdminQuery = (params: ListShipmentsParams) => {
	return useQuery<ListShipmentsResult>({
		queryKey: [...ADMIN_TRANSPORT_QUERY_KEY, "list", params],
		queryFn: async () => {
			const res = await transportService.getShipments(params);
			return res.data;
		},
		placeholderData: keepPreviousData,
	});
};

/** Chi tiết vận đơn đọc trực tiếp từ GHN — chỉ gọi khi mở modal chi tiết (mỗi lần gọi là 1 request tới GHN). */
export const useShipmentDetailQuery = (orderId: number) => {
	return useQuery<GhnShipmentDetail>({
		queryKey: [...ADMIN_TRANSPORT_QUERY_KEY, "detail", orderId],
		queryFn: async () => {
			const res = await transportService.getShipmentDetail(orderId);
			return res.data.data;
		},
		// Dữ liệu GHN đổi liên tục nhưng không cần realtime: không tự refetch khi focus lại cửa sổ,
		// admin chủ động bấm "Đồng bộ trạng thái" khi muốn cập nhật.
		refetchOnWindowFocus: false,
	});
};

// Thao tác ở trang Vận chuyển có thể đổi cả trạng thái đơn hàng (vd. GHN báo hoàn -> đơn chuyển "Đã hủy"),
// nên làm mới luôn cả danh sách Order lẫn danh sách vận chuyển.
const useInvalidateAfterShipmentChange = () => {
	const queryClient = useQueryClient();
	return () => {
		queryClient.invalidateQueries({ queryKey: ADMIN_TRANSPORT_QUERY_KEY });
		queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_QUERY_KEY });
	};
};

export const useSyncShipment = () => {
	const invalidate = useInvalidateAfterShipmentChange();
	return useMutation({
		mutationFn: (orderId: number) => transportService.syncShipment(orderId),
		onSuccess: (res) => {
			invalidate();
			toast.success(res.data.message ?? "Đã đồng bộ trạng thái vận chuyển.");
		},
		onError: (error) =>
			toast.error(getApiErrorMessage(error, "Đồng bộ trạng thái thất bại.")),
	});
};

export const useRedeliverShipment = () => {
	const invalidate = useInvalidateAfterShipmentChange();
	return useMutation({
		mutationFn: (orderId: number) =>
			transportService.redeliverShipment(orderId),
		onSuccess: (res) => {
			invalidate();
			toast.success(res.data.message ?? "Đã yêu cầu giao lại đơn.");
		},
		onError: (error) =>
			toast.error(getApiErrorMessage(error, "Yêu cầu giao lại thất bại.")),
	});
};

export const useReturnShipment = () => {
	const invalidate = useInvalidateAfterShipmentChange();
	return useMutation({
		mutationFn: (orderId: number) => transportService.returnShipment(orderId),
		onSuccess: (res) => {
			invalidate();
			toast.success(res.data.message ?? "Đã yêu cầu hoàn đơn.");
		},
		onError: (error) =>
			toast.error(getApiErrorMessage(error, "Yêu cầu hoàn đơn thất bại.")),
	});
};

/** Trả về URL trang in phiếu của GHN — việc mở tab mới do component gọi quyết định (xem shipment-detail-modal). */
export const usePrintShipment = () => {
	return useMutation({
		mutationFn: async ({
			orderId,
			size,
		}: {
			orderId: number;
			size: GhnPrintSize;
		}) => {
			const res = await transportService.getPrintUrl(orderId, size);
			return res.data.data.url as string;
		},
		onError: (error) =>
			toast.error(getApiErrorMessage(error, "Không thể tạo link in vận đơn.")),
	});
};
