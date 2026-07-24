import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BellIcon, CloseIcon, ShieldCheckIcon } from "./components/icons";
import Button from "./components/button";

const CustomIcon = ({ type }: { type: string }) => {
	const iconClasses = "w-6 h-6 flex-shrink-0";

	switch (type) {
		case "success":
			// Uses your burnt-orange accent color
			return <ShieldCheckIcon className={`${iconClasses} text-primary`} />;
		case "error":
			// Fallback styling for error alerts using standard semantic red
			return (
				<svg
					className={`${iconClasses} text-rose-600`}
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
					strokeWidth={1.75}>
					<circle cx='12' cy='12' r='9' />
					<path strokeLinecap='round' strokeLinejoin='round' d='M12 8v4m0 4h.01' />
				</svg>
			);
		default:
			// Uses your near-black ink color for info/generic announcements
			return <BellIcon className={`${iconClasses} text-ink`} />;
	}
};

const CustomCloseButton = ({ closeToast }: { closeToast: () => void }) => (
	<Button
		onClick={closeToast}
		type='button'
		variant='ghost'
		size='sm'
		className='ml-auto! p-1! px-2! rounded-md text-muted hover:text-ink hover:bg-cream-soft transition-colors duration-150 focus:outline-none'
		aria-label='Close notification'
		icon={<CloseIcon className='w-4 h-4' />}
	/>
);

const App = () => {
	return (
		<>
			<ToastContainer
				position='top-right'
				autoClose={3000}
				closeOnClick
				draggable
				icon={CustomIcon}
				closeButton={CustomCloseButton}
				// Custom cards styled specifically around your cream surface framework
				toastClassName='bg-[var(--color-surface)]! text-[var(--color-ink-soft)]! flex items-center! p-4! border-t border-black/5! shadow-xl! overflow-hidden!'
				className='text-sm font-sans flex items-center p-0 m-0 w-full tracking-wide'
				// Progress bar utilizing your accent primary token
				progressClassName='bg-primary!'
			/>
		</>
	);
};

export default App;
