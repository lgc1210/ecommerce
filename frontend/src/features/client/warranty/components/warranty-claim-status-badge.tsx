import type { WarrantyClaimStatus } from "../../../../shared/constants/warranty";
import { WARRANTY_CLAIM_STATUS_BADGE_CLASSNAME, WARRANTY_CLAIM_STATUS_LABEL } from "../utils";

const WarrantyClaimStatusBadge = ({ status }: { status: WarrantyClaimStatus }) => (
	<span
		className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold truncate ${WARRANTY_CLAIM_STATUS_BADGE_CLASSNAME[status]}`}>
		{WARRANTY_CLAIM_STATUS_LABEL[status]}
	</span>
);

export default WarrantyClaimStatusBadge;
