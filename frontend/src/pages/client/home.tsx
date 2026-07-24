import { Link } from "react-router-dom";
import Header from "../../features/client/header/components";
import Footer from "../../features/client/footer/components";
import Button from "../../components/button";
import paths from "../../configs/constants/paths";
import { mockCategories, mockProducts } from "../../configs/constants/mock-data";
import { formatCurrency } from "../../utils/currency";
import { ChevronRightIcon, HeadsetIcon, ShieldCheckIcon, TruckIcon } from "../../components/icons";
import ProductCard from "../../features/client/product/components/product-card";
import useTitle from "../../hooks/useTitle";

const trustBadges = [
	{
		icon: TruckIcon,
		title: "Miễn phí vận chuyển",
		description: "Áp dụng cho đơn hàng từ 500.000₫, giao nhanh trong 24-48 giờ.",
	},
	{
		icon: ShieldCheckIcon,
		title: "Thanh toán an toàn",
		description: "Hỗ trợ đầy đủ các phương thức thanh toán phổ biến, bảo mật SSL.",
	},
	{
		icon: HeadsetIcon,
		title: "Hỗ trợ 24/7",
		description: "Đội ngũ tư vấn sẵn sàng giải đáp mọi thắc mắc của bạn.",
	},
];

const latestProducts = mockProducts.slice(0, 6);
const popularProducts = [...mockProducts].reverse().slice(0, 6);
const featuredBanners = mockProducts.slice(2, 4);

const HomePage = () => {
	useTitle();

	return (
		<div className='flex min-h-screen flex-col bg-cream'>
			<Header />

			<main className='flex-1'>
				{/* Hero */}
				<section className='border-b border-border bg-cream-soft'>
					<div className='mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20'>
						<div>
							<span className='inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-dark'>
								Bộ sưu tập mới
							</span>
							<h1 className='mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl'>
								Phong cách phụ kiện &amp; thiết bị công nghệ mới
							</h1>
							<p className='mt-5 max-w-md text-base leading-relaxed text-muted'>
								Tuyển chọn tai nghe, loa, đồng hồ thông minh và thiết bị chơi game chất lượng cao — thiết kế tinh gọn,
								hiệu năng vượt trội.
							</p>
							<div className='mt-8 flex flex-wrap items-center gap-4'>
								<Link to={paths.client.shop}>
									<Button icon={<ChevronRightIcon className='h-4 w-4' />}>Mua ngay</Button>
								</Link>
								<Link to={paths.client.about}>
									<Button variant='outline'>Tìm hiểu thêm</Button>
								</Link>
							</div>
						</div>
						<div className='relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-surface'>
							<img
								src='https://placehold.co/700x700/faf6f0/d9641f?font=montserrat&text=Ecommerce'
								alt='Sản phẩm nổi bật'
								className='h-full w-full object-cover'
							/>
						</div>
					</div>
				</section>

				{/* Trust badges */}
				<section className='border-b border-border'>
					<div className='mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:grid-cols-3 lg:px-8'>
						{trustBadges.map(({ icon: Icon, title, description }) => (
							<div key={title} className='flex items-start gap-4'>
								<span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-dark'>
									<Icon className='h-6 w-6' />
								</span>
								<div>
									<h3 className='font-bold text-ink'>{title}</h3>
									<p className='mt-1 text-sm text-muted'>{description}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Top categories */}
				<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
					<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Danh mục nổi bật</h2>
					<div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
						{mockCategories.map((category) => (
							<Link
								key={category.slug}
								to={paths.client.shop}
								className='group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center transition-colors hover:border-primary'>
								<div className='flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-cream-soft'>
									<img src={category.image} alt={category.name} className='h-full w-full object-cover' />
								</div>
								<span className='text-sm font-semibold text-ink group-hover:text-primary-dark'>{category.name}</span>
								<span className='text-xs text-muted'>{category.productCount} sản phẩm</span>
							</Link>
						))}
					</div>
				</section>

				{/* Latest products */}
				<section className='border-y border-border bg-cream-soft'>
					<div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
						<div className='flex items-center justify-between'>
							<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Sản phẩm mới nhất</h2>
							<Link
								to={paths.client.shop}
								className='hidden items-center gap-1 text-sm font-semibold text-primary-dark hover:underline sm:flex'>
								Xem tất cả <ChevronRightIcon className='h-4 w-4' />
							</Link>
						</div>
						<div className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6'>
							{latestProducts.map((product) => (
								<ProductCard key={product.slug} product={product} />
							))}
						</div>
					</div>
				</section>

				{/* Featured banners */}
				<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
					<div className='grid gap-6 lg:grid-cols-2'>
						{featuredBanners.map((product) => (
							<div key={product.slug} className='flex items-center gap-6 rounded-3xl bg-ink p-8 text-cream'>
								<div className='flex-1'>
									<p className='text-xs font-bold uppercase tracking-wider text-primary'>Giá chỉ từ</p>
									<h3 className='mt-2 text-2xl font-extrabold'>{product.name}</h3>
									<p className='mt-2 text-2xl font-bold text-primary'>{formatCurrency(product.price)}</p>
									<p className='mt-3 max-w-xs text-sm text-cream/60'>{product.shortDescription}</p>
									<Link to={paths.client.productDetail(product.slug)}>
										<Button variant='primary' size='sm' className='mt-5'>
											Xem sản phẩm
										</Button>
									</Link>
								</div>
								<img
									src={product.image}
									alt={product.name}
									className='hidden h-32 w-32 shrink-0 rounded-2xl object-cover sm:block'
								/>
							</div>
						))}
					</div>
				</section>

				{/* Most popular */}
				<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
					<div className='text-center'>
						<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Được yêu thích nhất</h2>
						<p className='mx-auto mt-2 max-w-md text-sm text-muted'>
							Những sản phẩm được khách hàng lựa chọn và đánh giá cao nhất trong tháng.
						</p>
					</div>
					<div className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6'>
						{popularProducts.map((product) => (
							<ProductCard key={product.slug} product={product} />
						))}
					</div>
				</section>

				{/* Newsletter */}
				<section className='border-t border-border bg-primary'>
					<div className='mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8'>
						<h2 className='text-2xl font-extrabold tracking-tight text-white sm:text-3xl'>
							Đăng ký nhận ưu đãi 25% cho đơn hàng đầu tiên
						</h2>
						<p className='mt-2 text-sm text-white/80'>
							Nhận thông tin sản phẩm mới và mã giảm giá độc quyền qua email.
						</p>
						<form
							onSubmit={(e) => e.preventDefault()}
							className='mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row'>
							<input
								type='email'
								required
								placeholder='Nhập email của bạn'
								className='h-12 flex-1 rounded-full border-none bg-white px-5 text-sm text-ink outline-none placeholder:text-muted'
							/>
							<button
								type='submit'
								className='h-12 shrink-0 rounded-full bg-ink px-6 text-sm font-semibold text-white hover:bg-ink-soft'>
								Đăng ký
							</button>
						</form>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	);
};

export default HomePage;
