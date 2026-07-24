import type { OrderStatus } from "../types";
import { ORDER_STATUS_BADGE_CLASSNAME, ORDER_STATUS_LABEL } from "../utils";

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => (
	<span
		className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_BADGE_CLASSNAME[status]}`}>
		{ORDER_STATUS_LABEL[status]}
	</span>
);

export default OrderStatusBadge;
