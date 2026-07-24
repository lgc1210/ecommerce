import type { Role } from "../types";
import RoleItem from "./role-item";

interface Props {
	isLoadingRoles: boolean;
	roles: Role[];
	selectedRoleId: number | null;
	setSelectedRoleId: (id: number | null) => void;
}

const Roles = ({ isLoadingRoles, roles, selectedRoleId, setSelectedRoleId }: Props) => {
	return (
		<div className='rounded-2xl border border-border bg-surface p-4'>
			<p className='px-1 pb-3 text-xs font-semibold uppercase tracking-wider text-muted'>
				Danh sách role ({roles.length})
			</p>

			{isLoadingRoles ? (
				<p className='px-1 py-6 text-center text-sm text-muted'>Đang tải...</p>
			) : roles.length === 0 ? (
				<p className='px-1 py-6 text-center text-sm text-muted'>Chưa có role nào.</p>
			) : (
				<ul className='space-y-1.5'>
					{roles.map((role) => (
						<RoleItem key={role.id} role={role} selectedRoleId={selectedRoleId} setSelectedRoleId={setSelectedRoleId} />
					))}
				</ul>
			)}
		</div>
	);
};

export default Roles;
