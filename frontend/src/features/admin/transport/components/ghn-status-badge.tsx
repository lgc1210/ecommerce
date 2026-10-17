import { getGhnStatusBadgeClassName, getGhnStatusLabel } from "../utils";

const GhnStatusBadge = ({ status }: { status: string }) => (
	<span
		className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold truncate ${getGhnStatusBadgeClassName(status)}`}>
		{getGhnStatusLabel(status)}
	</span>
);

export default GhnStatusBadge;
