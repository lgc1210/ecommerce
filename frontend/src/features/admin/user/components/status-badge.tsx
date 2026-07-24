import { LockIcon } from "../../../../components/icons";

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
	<span
		className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
			isActive ? "bg-primary-light text-primary-dark" : "bg-ink/10 text-ink/60"
		}`}>
		{!isActive && <LockIcon className='h-3 w-3' />}
		{isActive ? "Hoạt động" : "Vô hiệu hóa"}
	</span>
);

export default StatusBadge;
