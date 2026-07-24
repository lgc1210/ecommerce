import type { ReactNode } from "react";
import { useAuth } from "../features/auth/hooks/useAuth";

export interface CanProps {
	/** Permission "resource:name" duy nhất cần có (vd. "catalog:write"). Bỏ qua nếu dùng `anyOf`. */
	permission?: string;
	/** Chỉ cần có 1 trong các permission này là đủ (vd. ["order:update", "order:read"]). */
	anyOf?: string[];
	/** Nội dung hiển thị khi có quyền. */
	children: ReactNode;
	/** Nội dung thay thế khi KHÔNG có quyền (mặc định: không hiển thị gì). */
	fallback?: ReactNode;
}

/**
 * Ẩn/hiện 1 phần UI (nút, hành động, cột trong bảng, ...) theo permission của
 * user hiện tại. Đây là lớp bảo vệ UX ở component-level, đi kèm với route guard
 * (requirePermissionLoader) chứ không thay thế: API phía backend luôn là nơi
 * kiểm tra permission thật sự, tránh trường hợp user sửa DOM/state để lộ nút bị ẩn.
 *
 * Ví dụ:
 *   <Can permission="catalog:write">
 *     <Button onClick={handleDelete}>Xoá sản phẩm</Button>
 *   </Can>
 *
 *   <Can anyOf={["order:update", "order:read"]} fallback={<span>Không có quyền xem</span>}>
 *     <OrderTable />
 *   </Can>
 */
const Can = ({ permission, anyOf, children, fallback = null }: CanProps) => {
	const { can, canAny } = useAuth();

	const allowed = anyOf ? canAny(anyOf) : permission ? can(permission) : false;

	return <>{allowed ? children : fallback}</>;
};

export default Can;
