import { useState } from "react";
import Button from "../../../components/button";
import Can from "../../../components/can";
import FormControl from "../../../components/form-control";
import FormSelect from "../../../components/form-select";
import Popup from "../../../components/popup";
import { CloseIcon, PlusIcon, SearchIcon, ShieldIcon } from "../../../components/icons";
import Pagination from "../../../components/pagination";
import permissions from "../../../configs/constants/permissions";
import { useCreateUser, useUpdateUserRole, useUpdateUserStatus, useUsersQuery } from "../../../features/admin/user/hooks";
import type { AdminUser } from "../../../features/admin/user/types";
import { getAvatarInitials } from "../../../utils/avatar-generator";
import useListQueryParams from "../../../hooks/useListQueryParams";
import { parseBooleanParam, parseNumberParam } from "../../../utils/searchParams";
import { useRolesQuery } from "../../../features/admin/rbac/hooks/useRbac";
import AdminTitle from "../../../components/admin-title";
import StatusBadge from "../../../features/admin/user/components/status-badge";
import CreateUserModal from "../../../features/admin/user/components/create-user-modal";
import { SkeletonTableRows } from "../../../shared/components/skeleton";

// Phải khớp với `defaultLimit` truyền cho <Pagination> bên dưới (xem docstring useListQueryParams/Pagination) —
// nếu không, số trang hiển thị trên UI sẽ không khớp với limit thực tế gửi lên backend, dẫn tới các trang
// "ảo" vượt quá dữ liệu thật (bấm vào sẽ trả về rỗng dù còn sản phẩm).
const PAGE_SIZE = 10;

/**
 * Trang quản trị User. Route "/admin/user" đã được bảo vệ bởi
 * requirePermissionLoader(permissions.user.read) (xem configs/routes/index.ts),
 * khớp với backend: GET /api/users yêu cầu "user:read".
 *
 * Phân trang + filter (search/roleId/isActive) được lưu thẳng trên URL query
 * string (?page=&search=&roleId=&isActive=) thay vì local state, để:
 * - Reload trang / back-forward vẫn giữ đúng bộ lọc đang xem.
 * - Copy link gửi cho đồng nghiệp là mở đúng view đó.
 *
 * Đổi role/trạng thái tài khoản là hành động ghi ("user:write"), nên 2 control
 * tương ứng được bọc trong <Can permission="user:write">, người chỉ có "user:read"
 * (vd. manager) sẽ chỉ xem được danh sách, không sửa được.
 */
const AdminUserPage = () => {
	const { searchParams, page, limit, search, searchInput, setSearchInput, setFilter, clearFilters, hasActiveFilters } = useListQueryParams({
		defaultLimit: PAGE_SIZE,
	});

	const roleId = parseNumberParam(searchParams, "roleId");
	const isActive = parseBooleanParam(searchParams, "isActive");

	const { data: roles = [] } = useRolesQuery();
	const { data, isLoading, isFetching } = useUsersQuery({ page, limit, search, roleId, isActive });
	const updateUserRole = useUpdateUserRole();
	const updateUserStatus = useUpdateUserStatus();
	const createUser = useCreateUser();

	const [pendingStatusUser, setPendingStatusUser] = useState<AdminUser | null>(null);
	const [createUserOpen, setCreateUserOpen] = useState(false);

	const users = data?.data ?? [];
	const pagination = data?.pagination;

	const handleConfirmStatusChange = () => {
		if (!pendingStatusUser) return;
		updateUserStatus.mutate({ id: pendingStatusUser.id, isActive: !pendingStatusUser.isActive }, { onSuccess: () => setPendingStatusUser(null) });
	};

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<AdminTitle title='Người dùng' description='Quản lý tài khoản, gán role và bật/tắt trạng thái hoạt động.' />

				<Can permission={permissions.user.write}>
					<Button size='sm' icon={<PlusIcon className='h-4 w-4' />} onClick={() => setCreateUserOpen(true)}>
						Tạo tài khoản
					</Button>
				</Can>
			</div>

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4'>
				<FormControl
					wrapperClassName='min-w-[220px] flex-1'
					placeholder='Tìm theo tên, email, SĐT...'
					value={searchInput}
					onChange={(e) => setSearchInput(e.target.value)}
					rightElement={<SearchIcon className='h-4 w-4 text-muted' />}
				/>
				<FormSelect
					value={roleId ?? ""}
					onChange={(e) => setFilter("roleId", e.target.value || undefined)}
					placeholder='Tất cả role'
					options={roles.map((role) => ({ value: role.id, label: role.name }))}
					className='capitalize'
				/>
				<FormSelect
					value={isActive === undefined ? "" : String(isActive)}
					onChange={(e) => setFilter("isActive", e.target.value || undefined)}
					placeholder='Tất cả trạng thái'
					options={[
						{ value: "true", label: "Đang hoạt động" },
						{ value: "false", label: "Đã vô hiệu hóa" },
					]}
				/>
				{hasActiveFilters(["roleId", "isActive"]) && (
					<Button
						type='button'
						size='sm'
						variant='ghost'
						onClick={clearFilters}
						icon={<CloseIcon className='h-4 w-4' />}
						iconPosition='left'
						className='gap-1.5! bg-transparent! px-0! my-auto text-muted! hover:text-ink!'>
						Xoá bộ lọc
					</Button>
				)}
			</div>

			{/* Table */}
			<div className='overflow-x-auto rounded-2xl border border-border bg-surface'>
				<table className='w-full min-w-180 text-left text-sm'>
					<thead>
						<tr className='border-b border-border text-xs font-semibold uppercase tracking-wider text-muted'>
							<th className='px-5 py-3.5'>Người dùng</th>
							<th className='px-5 py-3.5'>Liên hệ</th>
							<th className='px-5 py-3.5'>Role</th>
							<th className='px-5 py-3.5'>Trạng thái</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<SkeletonTableRows rows={PAGE_SIZE} columns={4} />
						) : users.length === 0 ? (
							<tr>
								<td colSpan={4} className='px-5 py-8 text-center text-muted'>
									Không tìm thấy người dùng nào.
								</td>
							</tr>
						) : (
							users.map((user) => (
								<tr key={user.id} className='border-b border-border last:border-0 hover:bg-cream-soft/60'>
									<td className='px-5 py-3.5'>
										<div className='flex items-center gap-3'>
											<span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-bold text-primary-dark'>{getAvatarInitials(user.name)}</span>
											<div className='min-w-0'>
												<p className='truncate font-semibold text-ink'>{user.name}</p>
												<a href={`mailto:${user.email}`} className='truncate text-xs text-muted hover:underline' title='Nhấn để gửi mail'>
													{user.email}
												</a>
											</div>
										</div>
									</td>
									<td className='px-5 py-3.5 text-ink/80'>
										{user.phone ? (
											<a href={`tel:${user.phone}`} className='hover:underline' title='Nhấn đề gọi'>
												{user.phone}
											</a>
										) : (
											"—"
										)}
									</td>
									<td className='px-5 py-3.5'>
										<Can
											permission={permissions.user.write}
											fallback={
												<span className='inline-flex items-center gap-1.5 rounded-full bg-cream-soft px-3 py-1 text-xs font-semibold capitalize text-ink/70'>
													<ShieldIcon className='h-3.5 w-3.5' />
													{user.role.name}
												</span>
											}>
											<FormSelect
												value={user.roleId}
												disabled={updateUserRole.isPending}
												onChange={(e) => updateUserRole.mutate({ id: user.id, roleId: Number(e.target.value) })}
												options={roles.map((role) => ({ value: role.id, label: role.name }))}
												size='sm'
												className='font-semibold capitalize'
											/>
										</Can>
									</td>
									<td className='px-5 py-3.5'>
										<Can permission={permissions.user.write} fallback={<StatusBadge isActive={user.isActive} />}>
											<button
												type='button'
												disabled={updateUserStatus.isPending}
												onClick={() => setPendingStatusUser(user)}
												className='inline-flex cursor-pointer items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60'
												title={user.isActive ? "Nhấn để vô hiệu hóa" : "Nhấn để kích hoạt"}>
												<StatusBadge isActive={user.isActive} />
											</button>
										</Can>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{isFetching && !isLoading && <p className='text-right text-xs text-muted'>Đang cập nhật...</p>}

			<Pagination total={pagination?.total ?? 0} defaultLimit={PAGE_SIZE} isLoading={isFetching} />

			{pendingStatusUser && (
				<Popup
					title={pendingStatusUser.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
					description={
						pendingStatusUser.isActive
							? `Tài khoản "${pendingStatusUser.name}" sẽ không thể đăng nhập cho tới khi được kích hoạt lại. Bạn có chắc chắn?`
							: `Kích hoạt lại tài khoản "${pendingStatusUser.name}"?`
					}
					variant={pendingStatusUser.isActive ? "danger" : "default"}
					confirmLabel={pendingStatusUser.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
					isConfirming={updateUserStatus.isPending}
					onConfirm={handleConfirmStatusChange}
					onClose={() => setPendingStatusUser(null)}
				/>
			)}

			{createUserOpen && (
				<CreateUserModal
					roles={roles}
					onClose={() => setCreateUserOpen(false)}
					onSubmit={(payload) => createUser.mutate(payload, { onSuccess: () => setCreateUserOpen(false) })}
					isSubmitting={createUser.isPending}
				/>
			)}
		</div>
	);
};

export default AdminUserPage;
