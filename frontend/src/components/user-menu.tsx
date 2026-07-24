import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDownIcon, LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import { useAuth, useLogout } from "../features/auth/hooks/useAuth";
import paths from "../configs/constants/paths";
import { getAvatarInitials } from "../utils/avatar-generator";

export interface UserMenuAction {
	/** Định danh duy nhất, dùng làm React key. */
	key: string;
	label: string;
	icon?: ReactNode;
	onClick: () => void;
	disabled?: boolean;
}

export interface UserMenuProps {
	/**
	 * Các mục hiển thị phía trên nút "Đăng xuất" (luôn có sẵn, không cần khai báo).
	 * Mặc định là mục "Cài đặt tài khoản" để giữ đúng hành vi cũ.
	 * Truyền mảng rỗng `[]` nếu không muốn hiển thị mục nào khác ngoài Đăng xuất.
	 */
	actions?: UserMenuAction[];
	/** Đường dẫn điều hướng tới sau khi đăng xuất thành công/thất bại. Mặc định: /login */
	redirectAfterLogout?: string;
	/** Căn trái/phải cho dropdown so với nút trigger. Mặc định: "right" */
	align?: "left" | "right";
	/** Ẩn tên/email trên màn hình nhỏ, chỉ hiện avatar. Mặc định: true */
	showDetailsOnMobile?: boolean;
}

const defaultActions: UserMenuAction[] = [
	{
		key: "settings",
		label: "Cài đặt tài khoản",
		icon: <SettingsIcon className='h-4 w-4 text-muted' />,
		onClick: () => {},
	},
];

/**
 * Menu tài khoản người dùng: avatar + tên/email, click để mở dropdown gồm các
 * hành động tuỳ chỉnh (mặc định "Cài đặt tài khoản") và luôn có "Đăng xuất".
 * Tự đóng khi click ra ngoài. Tự lấy user hiện tại qua useAuth(), không cần
 * truyền props user từ bên ngoài, nên có thể nhúng ở bất kỳ layout nào
 * (admin header, client account dropdown, ...).
 */
const UserMenu = ({
	actions = defaultActions,
	redirectAfterLogout = paths.auth.login,
	align = "right",
}: UserMenuProps) => {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const { user, isAuthenticated } = useAuth();
	const logoutMutation = useLogout();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		setOpen(false);
		logoutMutation.mutate(undefined, {
			onSettled: () => navigate(redirectAfterLogout, { replace: true }),
		});
	};

	if (!isAuthenticated) {
		return (
			<Link
				to={paths.auth.login}
				aria-label='Tài khoản'
				className='flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-cream-soft'>
				<UserIcon className='h-5 w-5' />
			</Link>
		);
	}

	return (
		<div className='relative' ref={menuRef}>
			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				className='flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-cream-soft hover:not-disabled:cursor-pointer'>
				<span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary-dark'>
					{getAvatarInitials(user?.name)}
				</span>
				<ChevronDownIcon className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
			</button>

			{open && (
				<div
					className={`absolute top-[calc(100%+8px)] w-52 overflow-hidden rounded-xl border border-border bg-surface shadow-lg shadow-ink/5 ${
						align === "right" ? "right-0" : "left-0"
					}`}>
					<div className='hidden text-left sm:block px-4 py-2.5'>
						<span className='block text-sm font-semibold leading-tight text-ink'>{user?.name ?? "..."}</span>
						<span className='block text-xs leading-tight text-muted'>{user?.email ?? ""}</span>
					</div>

					{actions.map((action) => (
						<button
							key={action.key}
							type='button'
							onClick={() => {
								setOpen(false);
								action.onClick();
							}}
							disabled={action.disabled}
							className='flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-ink hover:bg-cream-soft disabled:cursor-not-allowed disabled:opacity-60 hover:not-disabled:cursor-pointer'>
							{action.icon}
							{action.label}
						</button>
					))}

					{actions.length > 0 && <div className='h-px bg-border' />}

					<button
						type='button'
						onClick={handleLogout}
						disabled={logoutMutation.isPending}
						className='flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-primary-dark hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 hover:not-disabled:cursor-pointer'>
						<LogOutIcon className='h-4 w-4' />
						{logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
					</button>
				</div>
			)}
		</div>
	);
};

export default UserMenu;
