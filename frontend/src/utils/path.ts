import paths from "../configs/constants/paths";
import roles from "../configs/constants/roles";

export const getDefaultPathForRole = (roleName: string) => {
	return roles.customer === roleName ? paths.client.home : paths.admin.dashboard;
};
