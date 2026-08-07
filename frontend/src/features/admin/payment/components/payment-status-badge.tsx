import type { PaymentStatus } from "../types";
import { PAYMENT_STATUS_BADGE_CLASSNAME, PAYMENT_STATUS_LABEL } from "../utils";

const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
	<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold truncate ${PAYMENT_STATUS_BADGE_CLASSNAME[status]}`}>{PAYMENT_STATUS_LABEL[status]}</span>
);

export default PaymentStatusBadge;
