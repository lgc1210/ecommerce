import Button from "../../../../components/button";
import { MenuIcon } from "../../../../components/icons";
import UserMenu from "../../../../components/user-menu";
import AdminNotificationBell from "../../notification/components/notification-bell";

type HeaderProps = {
	onMenuClick: () => void;
};

const Header = ({ onMenuClick }: HeaderProps) => {
	return (
		<header className='w-full sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6'>
			<Button
				type='button'
				variant='primary'
				size='sm'
				onClick={onMenuClick}
				araia-label='Open menu'
				className='rounded-lg! px-2! border! border-border! bg-cream-soft! text-ink! hover:bg-primary-light! hover:text-primary-dark! lg:hidden'
				icon={<MenuIcon className='h-5 w-5' />}
			/>
			<div className='flex-1 flex gap-2 items-center justify-end'>
				<AdminNotificationBell />
				{/* User menu */}
				<UserMenu />
			</div>
		</header>
	);
};

export default Header;
