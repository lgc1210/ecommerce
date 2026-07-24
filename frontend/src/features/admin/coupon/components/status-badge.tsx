import type { AdminCoupon } from "../types";
import { COUPON_STATUS_BADGE_CLASSNAME, COUPON_STATUS_LABEL, getCouponDisplayStatus } from "../utils";

const StatusBadge = ({ coupon }: { coupon: AdminCoupon }) => {
	const status = getCouponDisplayStatus(coupon);
	return (
		<span
			className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${COUPON_STATUS_BADGE_CLASSNAME[status]}`}>
			{COUPON_STATUS_LABEL[status]}
		</span>
	);
};

export default StatusBadge;
