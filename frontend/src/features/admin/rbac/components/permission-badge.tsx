import { CheckIcon, XIcon } from "../../../../components/icons";

/** Chấm tròn xanh/xám thể hiện permission đã gán hay chưa cho role. */
const PermissionBadge = ({ isAssigned }: { isAssigned: boolean }) => (
	<span
		className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
			isAssigned ? "bg-primary text-white" : "bg-cream-soft text-muted"
		}`}>
		{isAssigned ? <CheckIcon className='h-3 w-3' /> : <XIcon className='h-3 w-3' />}
	</span>
);

export default PermissionBadge;
