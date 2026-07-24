import Button from "../../../../components/button";
import { BellIcon, MenuIcon, SearchIcon } from "../../../../components/icons";
import UserMenu from "../../../../components/user-menu";

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
				<button
					type='button'
					aria-label='Notifications'
					className='relative shrink-0 rounded-lg p-2 text-ink/70 hover:bg-cream-soft hover:text-ink cursor-pointer'>
					<BellIcon className='h-5 w-5' />
					<span className='absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-surface' />
				</button>

				{/* User menu */}
				<UserMenu />
			</div>

			{/* Search */}
			{/* <div className='relative ml-auto flex-1 max-w-sm'>
				<SearchIcon className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted' />
				<input
					type='text'
					placeholder='Tìm kiếm...'
					className='w-full rounded-lg border border-border bg-cream-soft/70 py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary-light'
				/>
			</div> */}
		</header>
	);
};

export default Header;
