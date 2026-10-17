import type { GhnPrintSize } from "../types";

/**
 * Nhãn tiếng Việt cho trạng thái vận chuyển của GHN (xem tài liệu "List Of Shipping Status" của GHN).
 * Trạng thái lạ GHN thêm sau này vẫn hiển thị được nhờ fallback về chính mã gốc ở getGhnStatusLabel.
 */
export const GHN_STATUS_LABEL: Record<string, string> = {
	ready_to_pick: "Chờ lấy hàng",
	picking: "Đang lấy hàng",
	money_collect_picking: "Đang làm việc với người bán",
	picked: "Đã lấy hàng",
	storing: "Đã nhập kho",
	transporting: "Đang luân chuyển",
	sorting: "Đang phân loại",
	delivering: "Đang giao hàng",
	money_collect_delivering: "Đang làm việc với người nhận",
	delivered: "Đã giao hàng",
	delivery_fail: "Giao thất bại",
	waiting_to_return: "Chờ giao lại",
	return: "Chờ hoàn hàng",
	return_transporting: "Đang luân chuyển hàng hoàn",
	return_sorting: "Đang phân loại hàng hoàn",
	returning: "Đang hoàn hàng",
	return_fail: "Hoàn hàng thất bại",
	returned: "Đã hoàn hàng",
	cancel: "Đã hủy",
	exception: "Xử lý ngoại lệ",
	damage: "Hàng hư hỏng",
	lost: "Hàng thất lạc",
};

export const getGhnStatusLabel = (status: string): string =>
	GHN_STATUS_LABEL[status] ?? status;

const AMBER = "bg-amber-50 text-amber-600";
const BLUE = "bg-blue-50 text-blue-600";
const VIOLET = "bg-violet-50 text-violet-600";
const GREEN = "bg-primary-light text-primary-dark";
const ORANGE = "bg-orange-50 text-orange-600";
const RED = "bg-red-50 text-red-600";
const GRAY = "bg-ink/10 text-ink/60";

const GHN_STATUS_BADGE_CLASSNAME: Record<string, string> = {
	ready_to_pick: AMBER,
	picking: AMBER,
	money_collect_picking: AMBER,
	picked: BLUE,
	storing: BLUE,
	transporting: BLUE,
	sorting: BLUE,
	delivering: VIOLET,
	money_collect_delivering: VIOLET,
	delivered: GREEN,
	waiting_to_return: ORANGE,
	return: ORANGE,
	return_transporting: ORANGE,
	return_sorting: ORANGE,
	returning: ORANGE,
	returned: GRAY,
	delivery_fail: RED,
	return_fail: RED,
	cancel: RED,
	exception: RED,
	damage: RED,
	lost: RED,
};

export const getGhnStatusBadgeClassName = (status: string): string =>
	GHN_STATUS_BADGE_CLASSNAME[status] ?? GRAY;

/**
 * Các thao tác theo trạng thái GHN, theo tài liệu API của GHN. Chỉ để ẩn/hiện nút cho gọn UX —
 * GHN vẫn là nơi quyết định cuối cùng và sẽ từ chối (kèm lý do, hiện qua toast) nếu không hợp lệ.
 *  - Giao lại (switch-status/storing): đơn giao thất bại nhiều lần sẽ vào "waiting_to_return" (chờ giao lại).
 *  - Hoàn hàng (switch-status/return): áp dụng khi đơn đang lưu kho hoặc chờ giao lại.
 *  - In phiếu: mọi đơn còn hiệu lực.
 */
export const canRedeliverShipment = (ghnStatus: string): boolean =>
	ghnStatus === "waiting_to_return";
export const canReturnShipment = (ghnStatus: string): boolean =>
	ghnStatus === "waiting_to_return" || ghnStatus === "storing";
export const canPrintShipment = (ghnStatus: string): boolean =>
	ghnStatus !== "cancel";

export const GHN_PRINT_SIZE_OPTIONS: { value: GhnPrintSize; label: string }[] =
	[
		{ value: "a5", label: "Khổ A5" },
		{ value: "80x80", label: "Khổ 80x80" },
		{ value: "50x72", label: "Khổ 50x72" },
	];
