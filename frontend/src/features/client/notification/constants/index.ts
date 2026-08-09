import { BellIcon, BoxIcon, CreditCardIcon, StarIcon, TagIcon, TruckIcon } from "../../../../components/icons";
import type { NotificationType } from "../types";

/** Icon đại diện cho từng loại thông báo — dùng chung cho dropdown chuông lẫn tab "Quản lý thông báo". */
export const NOTIFICATION_TYPE_ICON: Record<NotificationType, typeof BellIcon> = {
	order: BoxIcon,
	payment: CreditCardIcon,
	promotion: TagIcon,
	stock: TruckIcon,
	review: StarIcon,
	system: BellIcon,
};

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
	order: "Đơn hàng",
	payment: "Thanh toán",
	promotion: "Khuyến mãi",
	stock: "Tồn kho",
	review: "Đánh giá",
	system: "Hệ thống",
};
