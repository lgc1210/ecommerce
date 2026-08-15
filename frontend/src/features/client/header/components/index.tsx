import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import paths from "../../../../configs/constants/paths";
import Overlay from "../../../../components/overlay";
import { CartIcon, CloseIcon, MenuIcon, SettingsIcon } from "../../../../components/icons";
import UserMenu from "../../../../components/user-menu";
import { useCart } from "../../cart/hooks";
import Button from "../../../../components/button";
import NotificationBell from "../../notification/components/notification-bell";
import { formatCurrency } from "../../../../utils/currency";
import HoverPreview from "../../../../shared/components/hover-preview";

const navItems = [
	{ to: paths.client.home, label: "Trang chủ", end: true },
	{ to: paths.client.about, label: "Giới thiệu" },
	{ to: paths.client.shop, label: "Cửa hàng" },
	{ to: paths.client.contact, label: "Liên hệ" },
];

const Header = () => {
	const [mobileOpen, setMobileOpen] = useState(false);
	const navigate = useNavigate();
	const { totalQuantity, items } = useCart();

	const linkClass = ({ isActive }: { isActive: boolean }) => `text-sm font-semibold transition-colors cursor-default! ${isActive ? "text-primary-dark" : "text-ink/80 hover:text-primary-dark"}`;

	return (
		<header className='sticky top-0 z-30 border-b border-border bg-surface/95'>
			<div className='mx-auto flex h-18 max-w-7xl items-center lg:justify-between gap-4 px-4 sm:px-6 lg:px-8'>
				{/* Mobile menu toggle */}
				<Button type='button' variant='outline' onClick={() => setMobileOpen(true)} aria-label='Mở menu' className='size-10! p-0! rounded-full lg:hidden' icon={<MenuIcon className='h-5 w-5' />} />

				{/* Logo */}
				<Link to={paths.client.home} className='flex shrink-0 items-center gap-2 cursor-default!' viewTransition>
					<span className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-extrabold text-white'>E</span>
					<span className='text-xl font-extrabold tracking-tight text-ink hidden sm:block'>Commerce</span>
				</Link>

				{/* Desktop nav */}
				<nav className='ml-4 hidden items-center justify-center gap-7 lg:flex'>
					{navItems.map((item) => (
						<NavLink key={item.to} to={item.to} end={item.end} className={linkClass} viewTransition>
							{item.label}
						</NavLink>
					))}
				</nav>

				<div className='ml-auto flex items-center gap-1.5'>
					<UserMenu
						actions={[
							{
								key: "account",
								label: "Cài đặt tài khoản",
								icon: <SettingsIcon className='h-4 w-4 text-muted' />,
								onClick: () => navigate(paths.client.account),
							},
						]}
					/>

					<NotificationBell />

					<HoverPreview
						trigger={
							<Link
								to={paths.client.cart}
								aria-label='Giỏ hàng'
								aria-haspopup='dialog'
								className='relative flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream-soft cursor-default'
								viewTransition>
								<CartIcon className='h-5 w-5' />

								{totalQuantity > 0 && (
									<span className='absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white'>
										{totalQuantity > 99 ? "99+" : totalQuantity}
									</span>
								)}
							</Link>
						}>
						<div className='flex items-center justify-between border-b border-border px-4 py-3'>
							<p className='font-bold text-ink'>Giỏ hàng</p>
							<span className='text-sm text-muted'>{totalQuantity} sản phẩm</span>
						</div>

						{items.length === 0 ? (
							<div className='px-4 py-8 text-center text-sm text-muted'>Giỏ hàng của bạn đang trống.</div>
						) : (
							<>
								<div className='max-h-80 overflow-y-auto p-2'>
									{items.slice(0, 4).map((item) => (
										<Link key={item.id} to={paths.client.productDetail(item.productSlug)} className='flex gap-3 rounded-lg p-2 hover:bg-cream-soft cursor-default!' viewTransition>
											<img src={item.image} alt={item.productName} className='h-14 w-14 shrink-0 rounded-md object-cover' />
											<div className='min-w-0 flex-1'>
												<p className='truncate text-sm font-semibold text-ink'>{item.productName}</p>
												<p className='mt-0.5 truncate text-xs text-muted'>{Object.values(item.variationDetails ?? {}).join(" · ")}</p>
												<div className='mt-1 flex items-center justify-between gap-2'>
													<span className='text-sm font-bold text-primary-dark'>{formatCurrency(item.price)}</span>
													<span className='text-xs text-muted'>× {item.quantity}</span>
												</div>
											</div>
										</Link>
									))}
								</div>

								<div className='border-t border-border p-3'>
									<Link
										to={paths.client.cart}
										className='flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark cursor-default!'
										viewTransition>
										Xem giỏ hàng
									</Link>
								</div>
							</>
						)}
					</HoverPreview>
				</div>
			</div>

			{/* Mobile nav drawer */}
			<Overlay open={mobileOpen} onClose={() => setMobileOpen(false)} />
			<div className={`fixed inset-y-0 left-0 z-50! w-72 transform bg-surface transition-transform duration-500 ease-out lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
				<div className='flex h-16 items-center justify-between border-b border-border px-5'>
					<Link to={paths.client.home} className='flex shrink-0 items-center gap-2'>
						<span className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-extrabold text-white'>E</span>
						<span className='text-xl font-extrabold tracking-tight text-ink'>Commerce</span>
					</Link>{" "}
					<button type='button' onClick={() => setMobileOpen(false)} aria-label='Đóng menu' className='flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-cream-soft'>
						<CloseIcon className='h-5 w-5' />
					</button>
				</div>
				<nav className='flex flex-col gap-1 p-4'>
					{navItems.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.end}
							onClick={() => setMobileOpen(false)}
							className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-semibold cursor-default! ${isActive ? "bg-primary-light text-primary-dark" : "text-ink hover:bg-cream-soft"}`}>
							{item.label}
						</NavLink>
					))}
				</nav>
			</div>
		</header>
	);
};

export default Header;
