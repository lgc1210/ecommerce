import type { ContactStatus } from "../types";
import { CONTACT_STATUS_BADGE_CLASSNAME, CONTACT_STATUS_LABEL } from "../utils";

const StatusBadge = ({ status }: { status: ContactStatus }) => (
	<span
		className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold truncate ${CONTACT_STATUS_BADGE_CLASSNAME[status]}`}>
		{CONTACT_STATUS_LABEL[status]}
	</span>
);

export default StatusBadge;
