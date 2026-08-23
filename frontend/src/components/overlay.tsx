interface OverlayProps {
	open: boolean;
	onClose: () => void;
}

const Overlay = ({ open, onClose }: OverlayProps) => {
	return <div onClick={onClose} className={`fixed inset-0 z-50! bg-ink/50 transition-opacity duration-500 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}></div>;
};

export default Overlay;
