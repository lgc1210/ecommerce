import apiClient from "../../../../configs/apis";
import type { GhnPrintSize, ListShipmentsParams } from "../types";

const transportService = {
	getShipments: (params: ListShipmentsParams = {}) =>
		apiClient.get("/transport", {
			params: {
				page: params.page,
				limit: params.limit,
				ghnStatus: params.ghnStatus || undefined,
				search: params.search || undefined,
				dateFrom: params.dateFrom || undefined,
				dateTo: params.dateTo || undefined,
			},
		}),
	// `orderId` là id đơn hàng trong hệ thống (backend tra mã vận đơn GHN từ đơn này)
	getShipmentDetail: (orderId: number) =>
		apiClient.get(`/transport/${orderId}`),
	syncShipment: (orderId: number) =>
		apiClient.post(`/transport/${orderId}/sync`),
	getPrintUrl: (orderId: number, size: GhnPrintSize) =>
		apiClient.get(`/transport/${orderId}/print`, { params: { size } }),
	redeliverShipment: (orderId: number) =>
		apiClient.post(`/transport/${orderId}/redeliver`),
	returnShipment: (orderId: number) =>
		apiClient.post(`/transport/${orderId}/return`),
};

export default transportService;
