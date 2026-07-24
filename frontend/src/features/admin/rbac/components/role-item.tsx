import { ShieldIcon, UsersIcon } from "../../../../components/icons";
import type { Role } from "../types";

interface Props {
	role: Role;
	selectedRoleId: number | null;
	setSelectedRoleId: (id: number | null) => void;
}

const RoleItem = ({ role, selectedRoleId, setSelectedRoleId }: Props) => {
	return (
		<li key={role.id}>
			<button
				type='button'
				onClick={() => setSelectedRoleId(role.id)}
				className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
					selectedRoleId === role.id
						? "bg-primary text-white shadow-sm shadow-primary/25"
						: "text-ink hover:bg-cream-soft"
				}`}>
				<span className='flex min-w-0 items-center gap-2'>
					<ShieldIcon className='h-4 w-4 shrink-0' />
					<span className='truncate font-semibold capitalize'>{role.name}</span>
				</span>
				<span
					className={`flex shrink-0 items-center gap-1 text-xs ${
						selectedRoleId === role.id ? "text-white/80" : "text-muted"
					}`}>
					<UsersIcon className='h-3.5 w-3.5' />
					{role._count.users}
				</span>
			</button>
		</li>
	);
};

export default RoleItem;
