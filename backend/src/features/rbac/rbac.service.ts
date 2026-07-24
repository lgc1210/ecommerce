import prisma from "../../config/prisma.js";

class RbacService {
	// Create a brand new system user role
	async createRole(name: string, description: string = "") {
		const lowerCaseName = name.toLocaleLowerCase().trim();

		const existingRole = await prisma.role.findFirst({
			where: { name: lowerCaseName },
		});

		if (existingRole) {
			throw new Error(`Conflict: A role with the name '${name}' already exists.`);
		}

		return await prisma.role.create({
			data: {
				name: lowerCaseName,
				description,
			},
		});
	}

	// Fetch all roles stored inside the database
	async getAllRoles() {
		return await prisma.role.findMany({
			include: {
				_count: {
					select: { users: true }, // Displays how many accounts are using this role
				},
			},
		});
	}

	// Fetch a single role together with its assigned permissions
	async getRoleById(roleId: number) {
		const role = await prisma.role.findUnique({
			where: { id: roleId },
			include: {
				permissions: { include: { permission: true } },
				_count: { select: { users: true } },
			},
		});

		if (!role) {
			throw new Error("NotFound: Role does not exist.");
		}

		// Làm phẳng danh sách permission (bỏ lớp trung gian RolePermission cho gọn payload trả về client)
		const { permissions, ...rest } = role;
		return {
			...rest,
			permissions: permissions.map((rolePermission) => rolePermission.permission),
		};
	}

	// Create a brand new permission
	async createPermission(resource: string, name: string, description: string = "") {
		const lowerCaseResource = resource.toLocaleLowerCase().trim();
		const lowerCaseName = name.toLocaleLowerCase().trim();

		const existingPermission = await prisma.permission.findFirst({
			where: { resource: lowerCaseResource, name: lowerCaseName },
		});

		if (existingPermission) {
			throw new Error(`Conflict: A permission with resource '${resource}' and name '${name}' already exists.`);
		}

		return await prisma.permission.create({
			data: {
				resource: lowerCaseResource,
				name: lowerCaseName,
				description,
			},
		});
	}

	// Fetch all permissions stored inside the database
	async getAllPermissions() {
		return await prisma.permission.findMany({
			orderBy: [{ resource: "asc" }, { name: "asc" }],
		});
	}

	// Gán 1 hoặc nhiều permission cho 1 role
	async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
		const role = await prisma.role.findUnique({ where: { id: roleId } });
		if (!role) {
			throw new Error("NotFound: Role does not exist.");
		}

		const foundPermissions = await prisma.permission.findMany({
			where: { id: { in: permissionIds } },
			select: { id: true },
		});
		if (foundPermissions.length !== permissionIds.length) {
			throw new Error("BadRequest: One or more permissionId do not exist.");
		}

		// Bỏ qua các permission đã được gán từ trước để tránh vi phạm unique constraint (roleId, permissionId)
		const existingLinks = await prisma.rolePermission.findMany({
			where: { roleId, permissionId: { in: permissionIds } },
			select: { permissionId: true },
		});
		const alreadyAssignedIds = new Set(existingLinks.map((link) => link.permissionId));
		const newPermissionIds = permissionIds.filter((id) => !alreadyAssignedIds.has(id));

		if (newPermissionIds.length > 0) {
			await prisma.rolePermission.createMany({
				data: newPermissionIds.map((permissionId) => ({ roleId, permissionId })),
			});
		}

		return this.getRoleById(roleId);
	}

	// Thu hồi 1 permission khỏi role
	async revokePermissionFromRole(roleId: number, permissionId: number) {
		const link = await prisma.rolePermission.findFirst({ where: { roleId, permissionId } });
		if (!link) {
			throw new Error("NotFound: This role does not have the specified permission assigned.");
		}

		await prisma.rolePermission.delete({ where: { id: link.id } });

		return this.getRoleById(roleId);
	}
}

export default new RbacService();
