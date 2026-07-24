import type { SVGProps } from "react";

const base = {
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 1.75,
	strokeLinecap: "round" as const,
	strokeLinejoin: "round" as const,
	viewBox: "0 0 24 24",
};

export const DashboardIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<rect x='3' y='3' width='7' height='9' rx='1.5' />
		<rect x='14' y='3' width='7' height='5' rx='1.5' />
		<rect x='14' y='12' width='7' height='9' rx='1.5' />
		<rect x='3' y='16' width='7' height='5' rx='1.5' />
	</svg>
);

export const BoxIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z' />
		<path d='M3.5 7.5v9L12 21l8.5-4.5v-9' />
		<path d='M12 12v9' />
	</svg>
);

export const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<circle cx='9' cy='8' r='3.25' />
		<path d='M2.75 20c.7-3.2 3.2-5 6.25-5s5.55 1.8 6.25 5' />
		<circle cx='17' cy='7.5' r='2.5' />
		<path d='M15.5 20c.5-2.4 2-4.1 4.25-4.6' />
	</svg>
);

export const ShieldIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M12 3 5 6v5c0 4.5 3 7.6 7 10 4-2.4 7-5.5 7-10V6l-7-3Z' />
		<path d='m9.25 12 1.9 1.9 3.6-3.9' />
	</svg>
);

export const TagIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M11.25 3.5H6a2.5 2.5 0 0 0-2.5 2.5v5.25a2 2 0 0 0 .59 1.41l8 8a2 2 0 0 0 2.82 0l6.09-6.09a2 2 0 0 0 0-2.82l-8-8a2 2 0 0 0-1.41-.59Z' />
		<circle cx='8' cy='8' r='1.35' />
	</svg>
);

export const CouponIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.75 1.75 0 0 0 0 3.5V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.75 1.75 0 0 0 0-3.5V9Z' />
		<path d='M9.5 7v10' strokeDasharray='2.2 2.2' />
	</svg>
);

export const CartIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.1a2 2 0 0 0 2-1.6L20 8H6' />
		<circle cx='9.5' cy='20' r='1.35' />
		<circle cx='17' cy='20' r='1.35' />
	</svg>
);

export const CreditCardIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<rect x='2.5' y='5.5' width='19' height='13' rx='2' />
		<path d='M2.5 9.75h19' />
		<path d='M6 14.5h4' />
	</svg>
);

export const MailIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<rect x='2.5' y='5' width='19' height='14' rx='2' />
		<path d='m3 6.5 9 6.5 9-6.5' />
	</svg>
);

export const MenuIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M4 6.5h16M4 12h16M4 17.5h16' />
	</svg>
);

export const SearchIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<circle cx='10.75' cy='10.75' r='6.75' />
		<path d='m20 20-4.3-4.3' />
	</svg>
);

export const BellIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M6 9a6 6 0 1 1 12 0c0 4.2 1.3 5.8 2 6.5H4c.7-.7 2-2.3 2-6.5Z' />
		<path d='M9.7 19a2.3 2.3 0 0 0 4.6 0' />
	</svg>
);

export const ChevronDownIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='m6 9 6 6 6-6' />
	</svg>
);

export const LogOutIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9' />
		<path d='M15.5 16 20 12l-4.5-4' />
		<path d='M20 12H9' />
	</svg>
);

export const SettingsIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<circle cx='12' cy='12' r='3.25' />
		<path d='M19.4 13.5a1.7 1.7 0 0 0 .35 1.9l.06.06a2 2 0 1 1-2.9 2.9l-.06-.06a1.7 1.7 0 0 0-1.9-.35 1.7 1.7 0 0 0-1 1.55V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.55 1.7 1.7 0 0 0-1.9.35l-.06.06a2 2 0 1 1-2.9-2.9l.06-.06a1.7 1.7 0 0 0 .35-1.9 1.7 1.7 0 0 0-1.55-1H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.35-1.9l-.06-.06a2 2 0 1 1 2.9-2.9l.06.06a1.7 1.7 0 0 0 1.9.35H10a1.7 1.7 0 0 0 1-1.55V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.9-.35l.06-.06a2 2 0 1 1 2.9 2.9l-.06.06a1.7 1.7 0 0 0-.35 1.9V10c.14.6.63 1.06 1.55 1h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.55 1Z' />
	</svg>
);

export const ChevronsLeftIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='m11 17-5-5 5-5' />
		<path d='m18 17-5-5 5-5' />
	</svg>
);

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='m6 6 12 12M18 6 6 18' />
	</svg>
);

export const UserIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<circle cx='12' cy='8' r='3.5' />
		<path d='M4.75 20c.9-3.9 3.6-6 7.25-6s6.35 2.1 7.25 6' />
	</svg>
);

export const HeartIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M12 20.2s-7.2-4.4-9.7-9A5.4 5.4 0 0 1 12 6.4a5.4 5.4 0 0 1 9.7 4.8c-2.5 4.6-9.7 9-9.7 9Z' />
	</svg>
);

export const StarIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg viewBox='0 0 24 24' {...props}>
		<path fill='currentColor' d='m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7L12 3Z' />
	</svg>
);

export const ChevronRightIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='m9 6 6 6-6 6' />
	</svg>
);

export const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M12 5v14M5 12h14' />
	</svg>
);

export const MinusIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M5 12h14' />
	</svg>
);

export const PencilIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z' />
		<path d='m15 5 4 4' />
	</svg>
);

export const TrashIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M4 7h16' />
		<path d='M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2' />
		<path d='M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7' />
		<path d='M10 11v6M14 11v6' />
	</svg>
);

export const TruckIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M2.5 6.5h11v10h-11Z' />
		<path d='M13.5 10.5H18l3 3.5v2.5h-7.5Z' />
		<circle cx='6.5' cy='18' r='1.6' />
		<circle cx='17' cy='18' r='1.6' />
	</svg>
);

export const ShieldCheckIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M12 3 5 6v5c0 4.5 3 7.6 7 10 4-2.4 7-5.5 7-10V6l-7-3Z' />
		<path d='m9.25 12 1.9 1.9 3.6-3.9' />
	</svg>
);

export const HeadsetIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M4 13v-1a8 8 0 0 1 16 0v1' />
		<rect x='3' y='13' width='4' height='6' rx='1.3' />
		<rect x='17' y='13' width='4' height='6' rx='1.3' />
		<path d='M20 19v.5a3 3 0 0 1-3 3h-2.5' />
	</svg>
);

export const PhoneIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M6.5 3.5h3l1.3 4.5-2.2 1.7a11.4 11.4 0 0 0 5.2 5.2l1.7-2.2 4.5 1.3v3a2 2 0 0 1-2.1 2C11.6 18.6 5.4 12.4 4.5 5.6a2 2 0 0 1 2-2.1Z' />
	</svg>
);

export const MapPinIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M12 21s7-6.6 7-11.5a7 7 0 1 0-14 0C5 14.4 12 21 12 21Z' />
		<circle cx='12' cy='9.5' r='2.4' />
	</svg>
);

export const FilterIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M4 6h16M7 12h10M10 18h4' />
	</svg>
);

export const GridIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<rect x='3.5' y='3.5' width='7' height='7' rx='1.2' />
		<rect x='13.5' y='3.5' width='7' height='7' rx='1.2' />
		<rect x='3.5' y='13.5' width='7' height='7' rx='1.2' />
		<rect x='13.5' y='13.5' width='7' height='7' rx='1.2' />
	</svg>
);

export const ListIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M8 6h13M8 12h13M8 18h13' />
		<path d='M3 6h.01M3 12h.01M3 18h.01' />
	</svg>
);

export const FacebookIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M14 8.5h2.5V5.2h-2.7c-2.3 0-3.8 1.5-3.8 3.9v2H8v3.4h2v7.5h3.4v-7.5h2.6l.5-3.4h-3.1V9.4c0-.6.3-.9.6-.9Z' />
	</svg>
);

export const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M20.9 11a9 9 0 1 1 -3.3 -6l-2.6 2.4a5.5 5.5 0 1 0 2.1 6.6h-4.1v-3h7.9Z' />
	</svg>
);

export const InstagramIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<rect x='3.5' y='3.5' width='17' height='17' rx='4.5' />
		<circle cx='12' cy='12' r='4' />
		<circle cx='16.6' cy='7.4' r='0.9' fill='currentColor' stroke='none' />
	</svg>
);

export const TwitterIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M21 5.5a7.6 7.6 0 0 1-2.2.9 3.7 3.7 0 0 0-6.4 2.5c0 .3 0 .6.1.8A10.5 10.5 0 0 1 4.6 5.7a3.7 3.7 0 0 0 1.2 4.9 3.6 3.6 0 0 1-1.7-.5v.1a3.7 3.7 0 0 0 3 3.6 3.8 3.8 0 0 1-1.7.1 3.7 3.7 0 0 0 3.5 2.6A7.5 7.5 0 0 1 3 17.9a10.5 10.5 0 0 0 5.7 1.7c6.8 0 10.6-5.7 10.6-10.6v-.5A7.6 7.6 0 0 0 21 5.5Z' />
	</svg>
);

export const ArrowUpIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M12 19V5M6 11l6-6 6 6' />
	</svg>
);

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M4.5 12.5 9.5 17.5 19.5 6.5' />
	</svg>
);

export const XIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M18 6 6 18M6 6l12 12' />
	</svg>
);

export const UploadIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<path d='M12 15V4' />
		<path d='M7.5 8.5 12 4l4.5 4.5' />
		<path d='M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3' />
	</svg>
);

export const LockIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<rect x='5' y='11' width='14' height='9' rx='1.75' />
		<path d='M8 11V7.5a4 4 0 0 1 8 0V11' />
	</svg>
);

export const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
	<svg {...base} {...props}>
		<circle cx='12' cy='12' r='9' />
		<path d='M12 7v5l3.5 2' />
	</svg>
);
