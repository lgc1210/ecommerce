import { NavLink } from "react-router-dom";
import {
	BellIcon,
	BoxIcon,
	CartIcon,
	ChevronsLeftIcon,
	CloseIcon,
	CouponIcon,
	CreditCardIcon,
	DashboardIcon,
	MailIcon,
	ShieldIcon,
	StarIcon,
	TagIcon,
	TruckIcon,
	UsersIcon,
} from "../../../../components/icons";
import paths from "../../../../configs/constants/paths";
import Overlay from "../../../../components/overlay";
import { useAuth } from "../../../auth/hooks/useAuth";
import permissions from "../../../../configs/constants/permissions";
import type { ComponentType, SVGProps } from "react";

type SidebarProps = {
	open: boolean;
	onClose: () => void;
	collapsed: boolean;
	onToggleCollapse: () => void;
};

interface NavItem {
	to: string;
	label: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>; // hoặc ComponentType<SVGProps<SVGSVGElement>> tùy project của bạn
	permission: string;
	end?: boolean; // Thêm dấu ? để đánh dấu thuộc tính này là optional (có thể có hoặc không)
}

interface NavGroup {
	groupLabel: string;
	items: NavItem[];
}

const navGroups: NavGroup[] = [
	{
		groupLabel: "Tổng quan",
		items: [
			{
				to: paths.admin.dashboard,
				label: "Tổng quan",
				icon: DashboardIcon,
				end: true,
				permission: permissions.dashboard.read,
			},
		],
	},
	{
		groupLabel: "Quản lý sản phẩm",
		items: [
			{ to: paths.admin.product, label: "Sản phẩm", icon: BoxIcon, permission: permissions.catalog.read },
			{ to: paths.admin.category, label: "Danh mục", icon: TagIcon, permission: permissions.catalog.read },
		],
	},
	{
		groupLabel: "Quản lý bán hàng",
		items: [
			{ to: paths.admin.order, label: "Đơn hàng", icon: CartIcon, permission: permissions.order.update },
			{ to: paths.admin.payment, label: "Thanh toán", icon: CreditCardIcon, permission: permissions.payment.read },
			{ to: paths.admin.transport, label: "Vận chuyển", icon: TruckIcon, permission: permissions.transport.manage },
		],
	},
	{
		groupLabel: "Marketing & CSKH",
		items: [
			{ to: paths.admin.coupon, label: "Mã giảm giá", icon: CouponIcon, permission: permissions.coupon.manage },
			{ to: paths.admin.contact, label: "Liên hệ", icon: MailIcon, permission: permissions.contact.manage },
			{ to: paths.admin.review, label: "Đánh giá", icon: StarIcon, permission: permissions.review.update },
			{ to: paths.admin.notification, label: "Thông báo", icon: BellIcon, permission: permissions.notification.broadcast },
		],
	},
	{
		groupLabel: "Hệ thống",
		items: [
			{ to: paths.admin.user, label: "Người dùng", icon: UsersIcon, permission: permissions.user.read },
			{ to: paths.admin.role, label: "Vai trò", icon: ShieldIcon, permission: permissions.rbac.manage },
		],
	},
];

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) => {
	const { can } = useAuth();

	// Lọc các group và items dựa trên quyền của user
	const visibleGroups = navGroups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => can(item.permission)),
		}))
		.filter((group) => group.items.length > 0); // Chỉ giữ lại group nếu có ít nhất 1 item được hiển thị

	return (
		<>
			{/* Mobile backdrop */}
			<Overlay open={open} onClose={onClose} />

			<aside
				className={`fixed inset-y-0 left-0 z-50! flex w-64 shrink-0 flex-col bg-ink text-cream transform transition-all duration-500 ease-out lg:static lg:z-auto lg:translate-x-0 ${
					open ? "translate-x-0" : "-translate-x-full"
				} ${collapsed ? "lg:w-20" : "lg:w-64"}`}>
				{/* Brand Wrapper */}
				<div className={`flex h-16 items-center border-b border-white/10 px-5 ${collapsed ? "lg:justify-center lg:px-0" : "justify-between gap-2"}`}>
					<div className='flex items-center gap-2.5 lg:flex-0 flex-1'>
						<span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-extrabold text-white'>E</span>
						<span className={`text-lg font-bold tracking-tight text-white ${collapsed ? "lg:hidden" : ""}`}>
							<span className='font-medium text-primary'>Admin</span>
						</span>
					</div>

					{/* Mobile close */}
					<button
						onClick={onClose}
						aria-label='Close menu'
						type='button'
						title='Close'
						className='flex h-8 w-8 items-center justify-center rounded-lg text-cream/70 hover:bg-white/10 hover:text-white lg:hidden cursor-pointer'>
						<CloseIcon className='h-5 w-5' />
					</button>
				</div>

				{/* Nav Menu lướt cuộn độc lập */}
				<nav className='flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-5'>
					{visibleGroups.map((group, groupIdx) => (
						<div key={groupIdx} className='space-y-1'>
							{/* Tiêu đề nhóm - Sẽ ẩn đi khi sidebar thu gọn */}
							<p className={`px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-cream/35 ${collapsed ? "lg:hidden" : ""}`}>{group.groupLabel}</p>

							{/* Danh sách menu con trong nhóm */}
							{group.items.map(({ to, label, icon: Icon, end }) => (
								<NavLink
									key={to}
									to={to}
									end={end}
									title={label}
									onClick={onClose}
									className={({ isActive }) =>
										`group relative flex items-center gap-3 rounded-lg p-2 text-sm font-medium transition-colors cursor-default ${collapsed ? "lg:justify-center lg:px-0" : ""} ${
											isActive ? "bg-primary text-white shadow-sm shadow-primary/30" : "text-cream/70 hover:bg-white/5 hover:text-white"
										}`
									}>
									<Icon className='h-4.5 w-4.5 shrink-0' />
									<span className={collapsed ? "lg:hidden" : ""}>{label}</span>
								</NavLink>
							))}
						</div>
					))}
				</nav>

				{/* Footer Wrapper */}
				<div className='border-t border-white/10 p-4 shrink-0'>
					<div className={`rounded-lg bg-white/5 p-3.5 text-xs text-cream/60 ${collapsed ? "lg:hidden" : ""}`}>
						<p className='font-semibold text-cream/90'>Cần trợ giúp?</p>
						<p className='mt-1 leading-relaxed'>Xem tài liệu vận hành hệ thống hoặc liên hệ đội kỹ thuật.</p>
					</div>

					{/* Desktop collapse toggle */}
					<button
						onClick={onToggleCollapse}
						type='button'
						aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
						className={`hidden w-full items-center gap-2.5 rounded-lg p-2 text-sm font-medium text-cream/70 hover:bg-white/5 hover:text-white lg:flex cursor-default ${
							collapsed ? "lg:justify-center" : ""
						} ${collapsed ? "" : "mt-3"}`}>
						<ChevronsLeftIcon className={`h-4.5 w-4.5 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`} />
						<span className={collapsed ? "lg:hidden" : ""}>Thu gọn</span>
					</button>
				</div>
			</aside>
		</>
	);
};

export default Sidebar;
