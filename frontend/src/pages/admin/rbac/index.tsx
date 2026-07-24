import { useMemo, useState } from "react";
import Button from "../../../components/button";
import Can from "../../../components/can";
import { PlusIcon, ShieldIcon } from "../../../components/icons";
import permissions from "../../../configs/constants/permissions";
import {
	useAssignPermissions,
	useCreateRole,
	usePermissionsQuery,
	useRevokePermission,
	useRoleDetailQuery,
	useRolesQuery,
} from "../../../features/admin/rbac/hooks/useRbac";
import type { CreateRolePayload, Permission } from "../../../features/admin/rbac/types";
import AdminTitle from "../../../components/admin-title";
import PermissionBadge from "../../../features/admin/rbac/components/permission-badge";
import CreateRoleModal from "../../../features/admin/rbac/components/create-role-modal";
import Roles from "../../../features/admin/rbac/components/roles";

/**
 * Trang quản lý Role & Permission (RBAC). Route "/admin/role" đã được bảo vệ bởi
 * requirePermissionLoader(permissions.rbac.manage) (xem configs/routes/index.ts),
 * khớp với backend: toàn bộ endpoint /api/rbac/* đều yêu cầu permission "rbac:manage"
 * (trừ GET /roles chỉ yêu cầu đăng nhập).
 *
 * Bố cục 2 cột:
 * - Trái: danh sách role hệ thống (admin/manager/customer/...), chọn 1 role để xem chi tiết.
 * - Phải: checklist toàn bộ permission (nhóm theo resource) của role đang chọn, bật/tắt
 *   để gán (POST /rbac/roles/:roleId/permissions) hoặc thu hồi (DELETE .../:permissionId).
 */
const RbacPage = () => {
	const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
	const [createRoleOpen, setCreateRoleOpen] = useState(false);

	const { data: roles = [], isLoading: isLoadingRoles } = useRolesQuery();
	const { data: allPermissions = [], isLoading: isLoadingPermissions } = usePermissionsQuery();
	const { data: roleDetail, isFetching: isFetchingRoleDetail } = useRoleDetailQuery(selectedRoleId);

	const createRole = useCreateRole();
	const assignPermissions = useAssignPermissions();
	const revokePermission = useRevokePermission();

	// Gom permission theo resource (vd. "catalog" -> [read, write]) để hiển thị thành từng nhóm,
	// dễ quét mắt hơn là 1 danh sách phẳng dài.
	const permissionsByResource = useMemo(() => {
		const groups = new Map<string, Permission[]>();
		for (const permission of allPermissions) {
			const list = groups.get(permission.resource) ?? [];
			list.push(permission);
			groups.set(permission.resource, list);
		}
		return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [allPermissions]);

	const assignedPermissionIds = useMemo(
		() => new Set((roleDetail?.permissions ?? []).map((permission) => permission.id)),
		[roleDetail],
	);

	// Tạo role mới, sau đó nếu người dùng có chọn permission ngay trong modal thì gán
	// luôn cho role vừa tạo (2 lệnh gọi API tuần tự, vì backend POST /rbac/roles chỉ
	// nhận name/description, không nhận permissionIds).
	const handleCreateRole = async (payload: CreateRolePayload, permissionIds: number[]) => {
		try {
			const res = await createRole.mutateAsync(payload);
			const newRoleId = res.data.data.id as number;

			if (permissionIds.length > 0) {
				await assignPermissions.mutateAsync({ roleId: newRoleId, permissionIds });
			}

			setCreateRoleOpen(false);
			setSelectedRoleId(newRoleId);
		} catch {
			// Lỗi đã được hiển thị qua toast trong onError của từng mutation
			// (useCreateRole/useAssignPermissions). Giữ modal mở để người dùng sửa lại và thử tạo lần nữa.
		}
	};

	const handleTogglePermission = (permission: Permission, isAssigned: boolean) => {
		if (!selectedRoleId) return;

		if (isAssigned) {
			revokePermission.mutate({ roleId: selectedRoleId, permissionId: permission.id });
		} else {
			assignPermissions.mutate({ roleId: selectedRoleId, permissionIds: [permission.id] });
		}
	};

	const isMutatingPermission = assignPermissions.isPending || revokePermission.isPending;

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-wrap items-center justify-between gap-3'>
				<AdminTitle title='Phân quyền' description='Quản lý role hệ thống và quền được gán cho từng role.' />

				<Can permission={permissions.rbac.manage}>
					<div className='flex gap-2'>
						<Button size='sm' icon={<PlusIcon className='h-4 w-4' />} onClick={() => setCreateRoleOpen(true)}>
							Role mới
						</Button>
					</div>
				</Can>
			</div>

			<div className='grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]'>
				{/* Roles list */}
				<div className='rounded-2xl border border-border bg-surface p-4'>
					<p className='px-1 pb-3 text-xs font-semibold uppercase tracking-wider text-muted'>
						Danh sách role ({roles.length})
					</p>

					{isLoadingRoles ? (
						<p className='px-1 py-6 text-center text-sm text-muted'>Đang tải...</p>
					) : roles.length === 0 ? (
						<p className='px-1 py-6 text-center text-sm text-muted'>Chưa có role nào.</p>
					) : (
						<Roles
							isLoadingRoles={isLoadingRoles}
							roles={roles}
							selectedRoleId={selectedRoleId}
							setSelectedRoleId={setSelectedRoleId}
						/>
					)}
				</div>

				{/* Role detail / permission checklist */}
				<div className='rounded-2xl border border-border bg-surface p-5'>
					{!selectedRoleId ? (
						<div className='flex h-full min-h-60 flex-col items-center justify-center gap-2 text-center text-muted'>
							<ShieldIcon className='h-8 w-8' />
							<p className='text-sm'>Chọn role bên trái để xem và chỉnh sửa permission.</p>
						</div>
					) : (
						<div>
							<div className='mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4'>
								<div>
									<h3 className='text-lg font-bold capitalize text-ink'>{roleDetail?.name ?? "..."}</h3>
									{roleDetail?.description && <p className='mt-0.5 text-sm text-muted'>{roleDetail.description}</p>}
								</div>
								<span className='rounded-full bg-cream-soft px-3 py-1 text-xs font-semibold text-ink/70'>
									{roleDetail?._count.users ?? 0} người dùng
								</span>
							</div>

							{isFetchingRoleDetail || isLoadingPermissions ? (
								<p className='py-8 text-center text-sm text-muted'>Đang tải permission...</p>
							) : permissionsByResource.length === 0 ? (
								<p className='py-8 text-center text-sm text-muted'>Hệ thống chưa có permission nào.</p>
							) : (
								<div className='space-y-5'>
									{permissionsByResource.map(([resource, resourcePermissions]) => (
										<div key={resource}>
											<p className='mb-2 text-xs font-semibold uppercase tracking-wider text-muted'>{resource}</p>
											<div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
												{resourcePermissions.map((permission) => {
													const isAssigned = assignedPermissionIds.has(permission.id);
													return (
														<Can
															permission={permissions.rbac.manage}
															key={permission.id}
															fallback={
																<div className='flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm'>
																	<PermissionBadge isAssigned={isAssigned} />
																	<span className='truncate font-medium text-ink'>
																		{permission.resource}:{permission.name}
																	</span>
																</div>
															}>
															<Button
																type='button'
																disabled={isMutatingPermission}
																size='sm'
																variant='outline'
																onClick={() => handleTogglePermission(permission, isAssigned)}
																title={permission.description ?? undefined}
																className={`rounded-xl! justify-start! ${
																	isAssigned
																		? "border-primary/30! bg-primary-light/60! hover:border-primary!"
																		: "border-border hover:border-ink/20! hover:bg-cream-soft!"
																}`}>
																<PermissionBadge isAssigned={isAssigned} />
																<span className='truncate font-medium text-ink'>
																	{permission.resource}:{permission.name}
																</span>
															</Button>
														</Can>
													);
												})}
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{createRoleOpen && (
				<CreateRoleModal
					permissionsByResource={permissionsByResource}
					onClose={() => setCreateRoleOpen(false)}
					onSubmit={handleCreateRole}
					isSubmitting={createRole.isPending}
				/>
			)}
		</div>
	);
};

export default RbacPage;
