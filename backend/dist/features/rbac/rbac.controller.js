import rbacService from "./rbac.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";
export const createNewRole = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const role = await rbacService.createRole(name, description);
        res.status(201).json({
            message: "Role structural entity created successfully.",
            data: role,
        });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const fetchAllSystemRoles = async (req, res, next) => {
    try {
        const roles = await rbacService.getAllRoles();
        res.status(200).json({ data: roles });
    }
    catch (error) {
        next(error);
    }
};
export const fetchRoleById = async (req, res, next) => {
    try {
        const roleId = Number(req.params.roleId);
        const role = await rbacService.getRoleById(roleId);
        res.status(200).json({ data: role });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const createNewPermission = async (req, res, next) => {
    try {
        const { resource, name, description } = req.body;
        const permission = await rbacService.createPermission(resource, name, description);
        res.status(201).json({
            message: "Permission structural entity created successfully.",
            data: permission,
        });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const fetchAllPermissions = async (req, res, next) => {
    try {
        const permissions = await rbacService.getAllPermissions();
        res.status(200).json({ data: permissions });
    }
    catch (error) {
        next(error);
    }
};
export const assignPermissionsToRole = async (req, res, next) => {
    try {
        const roleId = Number(req.params.roleId);
        const { permissionIds } = req.body;
        const role = await rbacService.assignPermissionsToRole(roleId, permissionIds);
        res.status(200).json({
            message: "Permissions assigned to role successfully.",
            data: role,
        });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const revokePermissionFromRole = async (req, res, next) => {
    try {
        const roleId = Number(req.params.roleId);
        const permissionId = Number(req.params.permissionId);
        const role = await rbacService.revokePermissionFromRole(roleId, permissionId);
        res.status(200).json({
            message: "Permission revoked from role successfully.",
            data: role,
        });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
//# sourceMappingURL=rbac.controller.js.map