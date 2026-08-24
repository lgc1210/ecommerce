import { BellIcon, BoxIcon, CreditCardIcon, MailIcon, StarIcon, TagIcon, TruckIcon } from "../../components/icons";
import type { NotificationType } from "../../features/client/notification/types";

export const NOTIFICATION_TYPE = Object.freeze({
	order: "order",
	payment: "payment",
	stock: "stock",
	review: "review",
	contact: "contact",
	promotion: "promotion",
	system: "system",
} as const);

export const BROADCAST_NOTIFICATION_TYPE = Object.freeze({
	[NOTIFICATION_TYPE.promotion]: "promotion",
	[NOTIFICATION_TYPE.system]: "system",
});

/** Icon đại diện cho từng loại thông báo — dùng chung cho dropdown chuông lẫn tab "Quản lý thông báo" (cả client lẫn admin, xem features/admin/notification/constants). */
export const NOTIFICATION_TYPE_ICON: Record<NotificationType, typeof BellIcon> = {
	order: BoxIcon,
	payment: CreditCardIcon,
	promotion: TagIcon,
	stock: TruckIcon,
	review: StarIcon,
	system: BellIcon,
	contact: MailIcon,
};

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
	order: "Đơn hàng",
	payment: "Thanh toán",
	promotion: "Khuyến mãi",
	stock: "Tồn kho",
	review: "Đánh giá",
	system: "Hệ thống",
	contact: "Liên hệ",
};
