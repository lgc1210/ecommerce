import { useHomePageQuery } from "../../../features/client/home/hooks";
import HeroSection from "../../../features/client/home/components/hero-section";
import TrustBadgesSection from "../../../features/client/home/components/trust-badges-section";
import FeaturedCategoriesSection from "../../../features/client/home/components/featured-categories-section";
import LatestProductsSection from "../../../features/client/home/components/latest-products-section";
import FeaturedProductsCarouselSection from "../../../features/client/home/components/featured-products-carousel-section";
import PopularProductsSection from "../../../features/client/home/components/popular-products-section";
import NewsletterSection from "../../../features/client/home/components/newsletter-section";
import HeroSectionSkeleton from "../../../features/client/home/components/hero-section/skeleton";
import TrustBadgesSectionSkeleton from "../../../features/client/home/components/trust-badges-section/skeleton";

const HomePage = () => {
	// Toàn bộ nội dung trang (hero, danh sách giá trị cốt lõi) đều lấy động từ Strapi qua single type "home".
	// Các section còn lại (danh mục/sản phẩm) tự fetch dữ liệu riêng bên trong component của chúng.
	const { data, isLoading, isError } = useHomePageQuery();
	const page = data?.data;

	if (isError) {
		return <div className='flex min-h-[60vh] items-center justify-center text-center text-muted'>Không thể tải nội dung trang Giới thiệu. Vui lòng thử lại sau.</div>;
	}

	return (
		<div className='flex min-h-screen flex-col bg-cream'>
			<main className='flex-1'>
				{isLoading || !page ? <HeroSectionSkeleton /> : <HeroSection heroSection={page.hero_section} />}
				{isLoading || !page ? <TrustBadgesSectionSkeleton /> : <TrustBadgesSection valueItems={page.value_item} />}
				<FeaturedCategoriesSection />
				<LatestProductsSection />
				<FeaturedProductsCarouselSection />
				<PopularProductsSection />
				<NewsletterSection />
			</main>
		</div>
	);
};

export default HomePage;
