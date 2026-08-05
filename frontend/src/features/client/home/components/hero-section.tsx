import { Link } from "react-router-dom";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import Button from "../../../../components/button";
import { ChevronRightIcon } from "../../../../components/icons";
import paths from "../../../../configs/constants/paths";
import { getStrapiMediaUrl } from "../../../../utils/strapi";
import type { HomeHeroSection } from "../types";

const DEFAULT_BANNER_URL = "https://placehold.co/700x700/faf6f0/d9641f?font=montserrat&text=Ecommerce";

interface HeroSectionProps {
	heroSection: HomeHeroSection;
}

/** Hero đầu trang chủ - nội dung lấy từ Strapi (single type "home", field hero_section). */
const HeroSection = ({ heroSection }: HeroSectionProps) => {
	const bannerUrl = getStrapiMediaUrl(heroSection.banner?.url) ?? DEFAULT_BANNER_URL;

	return (
		<section className='border-b border-border bg-cream-soft'>
			<div className='mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20'>
				<div>
					<span className='inline-block rounded-full bg-primary-light px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-dark'>{heroSection.badge}</span>
					<h1 className='mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl lg:text-6xl'>{heroSection.title}</h1>
					<p className='mt-5 max-w-md text-base leading-relaxed text-muted'>
						<BlocksRenderer
							content={heroSection.content}
							blocks={{
								paragraph: ({ children }) => <p>{children}</p>,
							}}
						/>
					</p>
					<div className='mt-8 flex flex-wrap items-center gap-4'>
						<Link to={paths.client.shop}>
							<Button icon={<ChevronRightIcon className='h-4 w-4' />}>{heroSection.btn_text}</Button>
						</Link>
						<Link to={paths.client.about}>
							<Button variant='outline'>{heroSection.btn_second_text}</Button>
						</Link>
					</div>
				</div>
				<div className='relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-surface'>
					<img src={bannerUrl} alt='Sản phẩm nổi bật' className='h-full w-full object-cover' />
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
