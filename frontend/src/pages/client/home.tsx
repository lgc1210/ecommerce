import { useState, type SubmitEvent } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/button";
import paths from "../../configs/constants/paths";
import { mockProducts } from "../../configs/constants/mock-data";
import { formatCurrency } from "../../utils/currency";
import { ChevronRightIcon, HeadsetIcon, ShieldCheckIcon, TruckIcon } from "../../components/icons";
import ProductCard from "../../features/client/product/components/product-card";
import { useHomePageQuery } from "../../features/client/home/hooks";
import Loading from "../../shared/components/loading";
import { getStrapiMediaUrl } from "../../utils/strapi";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import FormControl from "../../components/form-control";
import { useRequestWelcomeCouponMutation } from "../../features/client/coupon/hooks";
import { useCategoriesQuery, useFeaturedCategoriesQuery, useProductsQuery } from "../../features/client/product/hooks";
import { toProductCardItem } from "../../features/client/product/utils";
import type { PublicCategory } from "../../features/client/product/types";
import { productSort } from "../../features/client/product/constants";

// Banner "Giá chỉ từ" chưa gắn với dữ liệu thật (không nằm trong phạm vi các mục cần triển khai),
// vẫn tạm dùng dữ liệu mẫu.
const featuredBanners = mockProducts.slice(2, 4);

const DEFAULT_BANNER_URL = "https://placehold.co/700x700/faf6f0/d9641f?font=montserrat&text=Ecommerce";

/** Ảnh đại diện cho danh mục — Category ở backend không có field ảnh riêng, dùng placeholder theo tên
 *  (cùng quy ước với FALLBACK_IMAGE của sản phẩm/DEFAULT_BANNER_URL ở trên). */
const getCategoryImage = (name: string) => `https://placehold.co/200x200/f3ede4/1c1815?font=montserrat&text=${encodeURIComponent(name)}`;

const HOME_PRODUCTS_LIMIT = 6;
const FEATURED_CATEGORIES_LIMIT = 10;

/** Map "icon_name" cấu hình ở Strapi (field value_item.icon_name) sang icon component tương ứng ở frontend. */
const VALUE_ICON_MAP: Record<string, typeof TruckIcon> = {
	Truck: TruckIcon,
	Shield: ShieldCheckIcon,
	Headset: HeadsetIcon,
};

const HomePage = () => {
	// Toàn bộ nội dung trang (hero, danh sách giá trị cốt lõi) đều lấy động từ Strapi qua single type "home".
	const { data, isLoading, isError } = useHomePageQuery();
	const page = data?.data;

	// Danh mục nổi bật (is_featured=true, cấu hình ở trang quản trị). Nếu admin chưa đánh dấu danh mục
	// nào là nổi bật, dùng tạm danh mục có nhiều sản phẩm nhất để mục này không bị bỏ trống.
	const { data: featuredCategoriesData, isLoading: isFeaturedCategoriesLoading } = useFeaturedCategoriesQuery(FEATURED_CATEGORIES_LIMIT);
	const featuredCategories = featuredCategoriesData?.data ?? [];
	const shouldFallbackCategories = !isFeaturedCategoriesLoading && featuredCategories.length === 0;

	const { data: allCategoriesData, isLoading: isAllCategoriesLoading } = useCategoriesQuery({ limit: FEATURED_CATEGORIES_LIMIT }, { enabled: shouldFallbackCategories });
	const fallbackCategories = [...(allCategoriesData?.data ?? [])].sort((a, b) => b._count.products - a._count.products);

	const isCategoriesLoading = isFeaturedCategoriesLoading || (shouldFallbackCategories && isAllCategoriesLoading);
	const displayedCategories: PublicCategory[] = featuredCategories.length > 0 ? featuredCategories : fallbackCategories;

	// Sản phẩm mới nhất — GET /products?sort=newest.
	const { data: latestProductsData, isLoading: isLatestProductsLoading } = useProductsQuery({
		limit: HOME_PRODUCTS_LIMIT,
		sort: productSort.newest,
	});
	const latestProducts = latestProductsData?.data ?? [];

	// Được yêu thích nhất — GET /products?sort=popular (sắp xếp theo số lượng đánh giá giảm dần).
	const { data: popularProductsData, isLoading: isPopularProductsLoading } = useProductsQuery({
		limit: HOME_PRODUCTS_LIMIT,
		sort: productSort.popular,
	});
	const popularProducts = popularProductsData?.data ?? [];

	// Form đăng ký email nhận mã giảm giá chào mừng đơn hàng đầu tiên
	const [welcomeEmail, setWelcomeEmail] = useState("");
	const requestWelcomeCouponMutation = useRequestWelcomeCouponMutation();

	const handleWelcomeCouponSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		if (!welcomeEmail) return;
		requestWelcomeCouponMutation.mutate(welcomeEmail, {
			onSuccess: () => setWelcomeEmail(""),
		});
	};

	if (isLoading) {
		return <Loading label='Đang tải nội dung...' />;
	}

	if (isError || !page) {
		return <div className='flex min-h-[60vh] items-center justify-center text-center text-muted'>Không thể tải nội dung trang Giới thiệu. Vui lòng thử lại sau.</div>;
	}

	const { hero_section, value_item } = page;
	const bannerUrl = getStrapiMediaUrl(hero_section.banner?.url) ?? DEFAULT_BANNER_URL;

	return (
		<div className='flex min-h-screen flex-col bg-cream'>
			<main className='flex-1'>
				{/* Hero */}
				<section className='border-b border-border bg-cream-soft'>
					<div className='mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20'>
						<div>
							<span className='inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-dark'>{hero_section.badge}</span>
							<h1 className='mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl'>{hero_section.title}</h1>
							<p className='mt-5 max-w-md text-base leading-relaxed text-muted'>
								<BlocksRenderer
									content={hero_section.content}
									blocks={{
										paragraph: ({ children }) => <p>{children}</p>,
									}}
								/>
							</p>
							<div className='mt-8 flex flex-wrap items-center gap-4'>
								<Link to={paths.client.shop}>
									<Button icon={<ChevronRightIcon className='h-4 w-4' />}>{hero_section.btn_text}</Button>
								</Link>
								<Link to={paths.client.about}>
									<Button variant='outline'>{hero_section.btn_second_text}</Button>
								</Link>
							</div>
						</div>
						<div className='relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-surface'>
							<img src={bannerUrl} alt='Sản phẩm nổi bật' className='h-full w-full object-cover' />
						</div>
					</div>
				</section>

				{/* Trust badges */}
				<section className='border-b border-border'>
					<div className='mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:grid-cols-3 lg:px-8'>
						{value_item.map((item) => {
							const Icon = VALUE_ICON_MAP[item.icon_name];
							return (
								<div key={item.id + item.title} className='flex items-start gap-4'>
									<span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary-dark'>
										<Icon className='h-6 w-6' />
									</span>
									<div>
										<h3 className='font-bold text-ink'>{item.title}</h3>
										<p className='mt-1 text-sm text-muted'>{item.description}</p>
									</div>
								</div>
							);
						})}
					</div>
				</section>

				{/* Top categories */}
				<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
					<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Danh mục nổi bật</h2>
					{isCategoriesLoading ? (
						<div className='mt-8'>
							<Loading size='sm' fullPage={false} />
						</div>
					) : displayedCategories.length > 0 ? (
						<div className='mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5'>
							{displayedCategories.map((category) => (
								<Link
									key={category.slug}
									to={`${paths.client.shop}?categoryId=${category.id}`}
									className='group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center transition-colors hover:border-primary'>
									<div className='flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-cream-soft'>
										<img src={getCategoryImage(category.name)} alt={category.name} className='h-full w-full object-cover' />
									</div>
									<span className='text-sm font-semibold text-ink group-hover:text-primary-dark'>{category.name}</span>
									<span className='text-xs text-muted'>{category._count.products} sản phẩm</span>
								</Link>
							))}
						</div>
					) : (
						<p className='mt-8 text-sm text-muted'>Chưa có danh mục nào để hiển thị.</p>
					)}
				</section>

				{/* Latest products */}
				<section className='border-y border-border bg-cream-soft'>
					<div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
						<div className='flex items-center justify-between'>
							<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Sản phẩm mới nhất</h2>
							<Link to={paths.client.shop} className='hidden items-center gap-1 text-sm font-semibold text-primary-dark hover:underline sm:flex'>
								Xem tất cả <ChevronRightIcon className='h-4 w-4' />
							</Link>
						</div>
						{isLatestProductsLoading ? (
							<div className='mt-8'>
								<Loading size='sm' fullPage={false} />
							</div>
						) : latestProducts.length > 0 ? (
							<div className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6'>
								{latestProducts.map((product) => (
									<ProductCard key={product.slug} product={toProductCardItem(product)} />
								))}
							</div>
						) : (
							<p className='mt-8 text-sm text-muted'>Chưa có sản phẩm nào để hiển thị.</p>
						)}
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
								<img src={product.image} alt={product.name} className='hidden h-32 w-32 shrink-0 rounded-2xl object-cover sm:block' />
							</div>
						))}
					</div>
				</section>

				{/* Most popular */}
				<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
					<div className='text-center'>
						<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Được yêu thích nhất</h2>
						<p className='mx-auto mt-2 max-w-md text-sm text-muted'>Những sản phẩm được khách hàng lựa chọn và đánh giá cao nhất trong tháng.</p>
					</div>
					{isPopularProductsLoading ? (
						<div className='mt-8'>
							<Loading size='sm' fullPage={false} />
						</div>
					) : popularProducts.length > 0 ? (
						<div className='mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6'>
							{popularProducts.map((product) => (
								<ProductCard key={product.slug} product={toProductCardItem(product)} />
							))}
						</div>
					) : (
						<p className='mt-8 text-center text-sm text-muted'>Chưa có sản phẩm nào để hiển thị.</p>
					)}
				</section>

				{/* Newsletter */}
				<section className='border-t border-border bg-primary'>
					<div className='mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8'>
						<h2 className='text-2xl font-extrabold tracking-tight text-white sm:text-3xl'>Đăng ký nhận ưu đãi 25% cho đơn hàng đầu tiên</h2>
						<p className='mt-2 text-sm text-white/80'>Nhận thông tin sản phẩm mới và mã giảm giá độc quyền qua email.</p>
						<form onSubmit={handleWelcomeCouponSubmit} className='mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row'>
							<FormControl
								type='email'
								required
								placeholder='Nhập email của bạn'
								className='flex-1 rounded-full!'
								value={welcomeEmail}
								onChange={(e) => setWelcomeEmail(e.target.value)}
								disabled={requestWelcomeCouponMutation.isPending}
							/>
							<Button
								type='submit'
								variant='dark'
								disabled={requestWelcomeCouponMutation.isPending}
								className='h-12 shrink-0 rounded-full bg-ink px-6 text-sm font-semibold text-white hover:bg-ink-soft'>
								{requestWelcomeCouponMutation.isPending ? "Đang gửi..." : "Đăng ký"}
							</Button>
						</form>
					</div>
				</section>
			</main>
		</div>
	);
};

export default HomePage;
