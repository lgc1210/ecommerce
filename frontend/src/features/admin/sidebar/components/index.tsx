import { NavLink } from "react-router-dom";
import {
	BoxIcon,
	CartIcon,
	ChevronsLeftIcon,
	CloseIcon,
	CouponIcon,
	CreditCardIcon,
	DashboardIcon,
	MailIcon,
	ShieldIcon,
	TagIcon,
	UsersIcon,
} from "../../../../components/icons";
import paths from "../../../../configs/constants/paths";
import Overlay from "../../../../components/overlay";
import { useAuth } from "../../../auth/hooks/useAuth";
import permissions from "../../../../configs/constants/permissions";

type SidebarProps = {
	open: boolean;
	onClose: () => void;
	collapsed: boolean;
	onToggleCollapse: () => void;
};

// permission tương ứng với mỗi mục menu phải khớp với requirePermissionLoader
// đã khai báo cho route đó trong configs/routes (và khớp với backend *.routes.ts),
// để không xảy ra tình trạng thấy menu nhưng bấm vào lại bị chặn.
const navItems = [
	{
		to: paths.admin.dashboard,
		label: "Dashboard",
		icon: DashboardIcon,
		end: true,
		permission: permissions.dashboard.read,
	},
	{ to: paths.admin.product, label: "Products", icon: BoxIcon, permission: permissions.catalog.read },
	{ to: paths.admin.category, label: "Categories", icon: TagIcon, permission: permissions.catalog.read },
	{ to: paths.admin.coupon, label: "Coupons", icon: CouponIcon, permission: permissions.coupon.manage },
	{ to: paths.admin.order, label: "Orders", icon: CartIcon, permission: permissions.order.update },
	{ to: paths.admin.payment, label: "Payments", icon: CreditCardIcon, permission: permissions.payment.read },
	{ to: paths.admin.user, label: "Users", icon: UsersIcon, permission: permissions.user.read },
	{ to: paths.admin.role, label: "Roles", icon: ShieldIcon, permission: permissions.rbac.manage },
	{ to: paths.admin.contact, label: "Contacts", icon: MailIcon, permission: permissions.contact.manage },
];

const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) => {
	const { can } = useAuth();
	const visibleNavItems = navItems.filter((item) => can(item.permission));

	return (
		<>
			{/* Mobile backdrop */}
			<Overlay open={open} onClose={onClose} />

			<aside
				className={`fixed inset-y-0 left-0 z-50! flex w-64 shrink-0 flex-col bg-ink text-cream transform transition-all duration-500 ease-out lg:static lg:z-auto lg:translate-x-0 ${
					open ? "translate-x-0" : "-translate-x-full"
				} ${collapsed ? "lg:w-20" : "lg:w-64"}`}>
				<div className='sticky top-0 z-20'>
					{/* Brand */}
					<div
						className={`flex h-16 items-center border-b border-white/10 px-5 ${
							collapsed ? "lg:justify-center lg:px-0" : "justify-between gap-2"
						}`}>
						<div className='flex items-center gap-2.5 lg:flex-0 flex-1'>
							<span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-extrabold text-white'>
								E
							</span>
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

					{/* Nav */}
					<nav className='flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-5'>
						<p
							className={`px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-cream/35 ${
								collapsed ? "lg:hidden" : ""
							}`}>
							Quản lý
						</p>
						{visibleNavItems.map(({ to, label, icon: Icon, end }) => (
							<NavLink
								key={to}
								to={to}
								end={end}
								title={label}
								onClick={onClose}
								className={({ isActive }) =>
									`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
										collapsed ? "lg:justify-center lg:px-0" : ""
									} ${
										isActive
											? "bg-primary text-white shadow-sm shadow-primary/30"
											: "text-cream/70 hover:bg-white/5 hover:text-white"
									}`
								}>
								<Icon className='h-4.5 w-4.5 shrink-0' />
								<span className={collapsed ? "lg:hidden" : ""}>{label}</span>
							</NavLink>
						))}
					</nav>

					{/* Footer */}
					<div className='border-t border-white/10 p-4'>
						<div className={`rounded-lg bg-white/5 p-3.5 text-xs text-cream/60 ${collapsed ? "lg:hidden" : ""}`}>
							<p className='font-semibold text-cream/90'>Cần trợ giúp?</p>
							<p className='mt-1 leading-relaxed'>Xem tài liệu vận hành hệ thống hoặc liên hệ đội kỹ thuật.</p>
						</div>

						{/* Desktop collapse toggle */}
						<button
							onClick={onToggleCollapse}
							type='button'
							aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
							className={`hidden w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-cream/70 hover:bg-white/5 hover:text-white lg:flex cursor-pointer ${
								collapsed ? "lg:justify-center" : ""
							} ${collapsed ? "" : "mt-3"}`}>
							<ChevronsLeftIcon
								className={`h-4.5 w-4.5 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`}
							/>
							<span className={collapsed ? "lg:hidden" : ""}>Thu gọn</span>
						</button>
					</div>
				</div>
			</aside>
		</>
	);
};

export default Sidebar;
