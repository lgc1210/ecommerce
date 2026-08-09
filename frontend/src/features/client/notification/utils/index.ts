import paths from "../../../../configs/constants/paths";

export const timeAgo = (value: string) => {
	const diffMs = Date.now() - new Date(value).getTime();
	const minutes = Math.floor(diffMs / 60_000);
	if (minutes < 1) return "Vừa xong";
	if (minutes < 60) return `${minutes} phút trước`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} giờ trước`;
	const days = Math.floor(hours / 24);
	return `${days} ngày trước`;
};

const ORDER_ACTION_URL_PATTERN = /^\/orders\/(\d+)$/;

/**
 * `actionUrl` backend trả về (vd "/orders/123") là 1 đường dẫn "khái niệm", KHÔNG phải route
 * thật trên frontend — trang tài khoản chỉ có đúng 1 route "/account", các tab (kể cả chi tiết
 * đơn hàng) được quản lý bằng state cục bộ trong OrdersTab (xem selectedOrderId), không phải
 * bằng URL. Nếu Link thẳng tới actionUrl như 1 URL thật sẽ vào thẳng route không tồn tại (404).
 *
 * Hàm này dịch actionUrl thành đích điều hướng thật (route + state) mà router hiểu được, dùng
 * lại đúng cơ chế location.state đã có sẵn để chuyển tab (xem account.tsx, notification-bell.tsx
 * mục "Xem tất cả").
 *
 * Muốn thêm loại actionUrl mới (vd sau này thông báo "review" trỏ tới "/product/:slug", vốn ĐÃ
 * là route thật) — chỉ cần thêm 1 nhánh if ở đây, không cần sửa notification-bell.tsx hay
 * notifications-tab.tsx.
 */
export const resolveNotificationLink = (actionUrl: string): { to: string; state?: Record<string, unknown> } => {
	const orderMatch = actionUrl.match(ORDER_ACTION_URL_PATTERN);
	if (orderMatch) {
		return { to: paths.client.account, state: { tab: "orders", orderId: Number(orderMatch[1]) } };
	}

	// Không khớp mẫu nào đã biết -> coi là route thật, điều hướng thẳng (an toàn cho các loại actionUrl chưa gặp).
	return { to: actionUrl };
};
