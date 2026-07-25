import { Link } from "react-router-dom";
import paths from "../../../../configs/constants/paths";
import { mockProducts } from "../../../../configs/constants/mock-data";
import { formatCurrency } from "../../../../utils/currency";
import {
	FacebookIcon,
	InstagramIcon,
	MailIcon,
	MapPinIcon,
	PhoneIcon,
	TwitterIcon,
} from "../../../../components/icons";

const quickLinks = [
	{ to: paths.client.home, label: "Trang chủ" },
	{ to: paths.client.about, label: "Giới thiệu" },
	{ to: paths.client.shop, label: "Cửa hàng" },
	{ to: paths.client.contact, label: "Liên hệ" },
	{ to: paths.client.cart, label: "Giỏ hàng" },
];

const accountLinks = [
	{ to: paths.auth.login, label: "Đăng nhập" },
	{ to: paths.auth.register, label: "Đăng ký" },
];

const contactItems = [
	{
		id: "address",
		icon: <MapPinIcon className='mt-0.5 h-4 w-4 shrink-0 text-primary' />,
		content: <p>Toà nhà Ecommerce, Quận 8, TP. Hồ Chí Minh</p>,
		className: "items-start",
	},
	{
		id: "phone",
		icon: <PhoneIcon className='h-4 w-4 shrink-0 text-primary' />,
		content: <a href='tel:0123456789'>0123 456 789</a>,
		className: "items-center hover:underline hover:not-disabled:cursor-pointer",
	},
	{
		id: "email",
		icon: <MailIcon className='h-4 w-4 shrink-0 text-primary' />,
		content: <a href='mailto:support@ecommerce.vn'>support@ecommerce.vn</a>,
		className: "items-center hover:underline hover:not-disabled:cursor-pointer",
	},
];

const newProducts = mockProducts.slice(0, 3);

const Footer = () => {
	return (
		<footer className='border-t border-border bg-ink text-cream'>
			<div className='mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-2 gap-10 md:grid-cols-4'>
					<div className='col-span-2 md:col-span-1'>
						<Link to={paths.client.home} className='flex items-center gap-2'>
							<span className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-extrabold text-white'>
								E
							</span>
							<span className='text-xl font-extrabold tracking-tight text-white'>Commerce</span>
						</Link>
						<p className='mt-4 text-sm leading-relaxed text-cream/60'>
							Cửa hàng phụ kiện công nghệ với những sản phẩm được tuyển chọn kỹ lưỡng, giao hàng nhanh và chính sách đổi
							trả rõ ràng.
						</p>
						<div className='mt-5 flex items-center gap-3'>
							{[FacebookIcon, InstagramIcon, TwitterIcon].map((Icon, i) => (
								<a
									key={i}
									href='#'
									aria-label='Mạng xã hội'
									className='flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-cream/70 hover:bg-primary hover:text-white'>
									<Icon className='h-4 w-4' />
								</a>
							))}
						</div>
					</div>

					<div>
						<h3 className='text-sm font-semibold uppercase tracking-wider text-cream/40'>Liên kết</h3>
						<ul className='mt-4 space-y-2.5 text-sm'>
							{quickLinks.map((link) => (
								<li key={link.to + new Date().getTime()}>
									<Link to={link.to} className='text-cream/70 hover:text-primary'>
										{link.label}
									</Link>
								</li>
							))}
							{accountLinks.map((link) => (
								<li key={link.to + new Date().getTime()}>
									<Link to={link.to} className='text-cream/70 hover:text-primary'>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					<div>
						<h3 className='text-sm font-semibold uppercase tracking-wider text-cream/40'>Liên hệ</h3>
						<ul className='mt-4 space-y-3 text-sm text-cream/70'>
							{contactItems.map((item) => (
								<li key={item.id + new Date().getTime()} className={`flex gap-2.5 ${item.className}`}>
									{item.icon}
									{item.content}
								</li>
							))}
						</ul>
					</div>

					<div className='col-span-2 md:col-span-1'>
						<h3 className='text-sm font-semibold uppercase tracking-wider text-cream/40'>Sản phẩm mới</h3>
						<ul className='mt-4 space-y-3'>
							{newProducts.map((product) => (
								<li key={product.slug + new Date().getTime()}>
									<Link to={paths.client.productDetail(product.slug)} className='flex items-center gap-3 group'>
										<img
											src={product.image}
											alt={product.name}
											className='h-12 w-12 shrink-0 rounded-lg object-cover'
										/>
										<span>
											<span className='block line-clamp-1 text-sm text-cream/80 group-hover:text-primary'>
												{product.name}
											</span>
											<span className='block text-xs font-semibold text-primary'>{formatCurrency(product.price)}</span>
										</span>
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			<div className='flex items-center justify-center border-t border-white/10'>
				<div className='mx-auto gap-3 px-4 py-5 text-xs text-cream/50 sm:flex-row sm:justify-between sm:px-6 lg:px-8'>
					<p>© {new Date().getFullYear()} Ecommerce. Thiết kế lấy cảm hứng từ Etonal Webflow Template.</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
