import type { SVGProps } from "react";
import { Link } from "react-router-dom";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import BreadCrumb from "../../components/breadcrumb";
import Button from "../../components/button";
import Loading from "../../shared/components/loading";
import paths from "../../configs/constants/paths";
import { HeadsetIcon, ShieldCheckIcon, TruckIcon } from "../../components/icons";
import { useAboutPageQuery } from "../../features/client/about/hooks";
import { getStrapiMediaUrl } from "../../utils/strapi";

const DEFAULT_BANNER_URL = "https://placehold.co/700x560/f3ede4/1c1815?font=montserrat&text=Ecommerce+Story";

// icon_name cấu hình trên Strapi (vd "shield", "truck", "headset") -> component icon tương ứng ở frontend.
// Icon nào chưa map thì fallback về ShieldCheckIcon thay vì crash trang.
const VALUE_ICON_MAP: Record<string, (props: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
	shield: ShieldCheckIcon,
	truck: TruckIcon,
	headset: HeadsetIcon,
};

const AboutPage = () => {
	// Toàn bộ nội dung trang (breadcrumb, story, số liệu, giá trị cốt lõi, CTA)
	// đều lấy động từ Strapi qua single type "about-page".
	const { data, isLoading, isError } = useAboutPageQuery();
	const page = data?.data;

	if (isLoading) {
		return <Loading label='Đang tải nội dung...' />;
	}

	if (isError || !page) {
		return <div className='flex min-h-[60vh] items-center justify-center text-center text-muted'>Không thể tải nội dung trang Giới thiệu. Vui lòng thử lại sau.</div>;
	}

	const { breadcrumb, stats_section, cta_section, story_section, value_section } = page;
	const bannerUrl = getStrapiMediaUrl(story_section.banner?.url) ?? DEFAULT_BANNER_URL;

	return (
		<div>
			<BreadCrumb title={breadcrumb.title} description={breadcrumb.description} />

			{/* Story */}
			<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
				<div className='grid items-center gap-10 lg:grid-cols-2'>
					<div className='overflow-hidden rounded-3xl bg-cream-soft min-h-96 h-full'>
						<img src={bannerUrl} alt={story_section.banner?.alternativeText ?? story_section.title} className='w-full h-full object-cover' />
					</div>
					<div>
						<span className='text-xs font-bold uppercase tracking-wider text-primary-dark'>{story_section.badge}</span>
						<h2 className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>{story_section.title}</h2>
						<div className='mt-5 space-y-4 leading-relaxed text-muted'>
							<BlocksRenderer
								content={story_section.content}
								blocks={{
									paragraph: ({ children }) => <p>{children}</p>,
								}}
							/>
						</div>
						<Link to={paths.client.shop} viewTransition>
							<Button className='mt-6'>{story_section.btn_text}</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className='border-y border-border bg-ink'>
				<div className='mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 text-center sm:px-6 lg:grid-cols-4 lg:px-8'>
					{stats_section.map((stat) => (
						<div key={stat.id}>
							<p className='text-3xl font-extrabold text-primary sm:text-4xl'>{stat.value}</p>
							<p className='mt-2 text-sm text-cream/60'>{stat.label}</p>
						</div>
					))}
				</div>
			</section>

			{/* Values */}
			<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
				<div className='text-center'>
					<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>{value_section.title}</h2>
					<p className='mx-auto mt-2 max-w-md text-sm text-muted'>{value_section.description}</p>
				</div>
				<div className='mt-10 grid gap-6 sm:grid-cols-3'>
					{value_section.items.map((item) => {
						const Icon = VALUE_ICON_MAP[item.icon_name] ?? ShieldCheckIcon;
						return (
							<div key={item.id} className='rounded-2xl border border-border bg-surface p-7 text-center'>
								<span className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark'>
									<Icon className='h-7 w-7' />
								</span>
								<h3 className='mt-5 font-bold text-ink'>{item.title}</h3>
								<p className='mt-2 text-sm leading-relaxed text-muted'>{item.description}</p>
							</div>
						);
					})}
				</div>
			</section>

			{/* CTA */}
			<section className='border-t border-border bg-primary'>
				<div className='mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-14 text-center sm:px-6 lg:px-8'>
					<h2 className='text-2xl font-extrabold tracking-tight text-white sm:text-3xl'>{cta_section.title}</h2>
					<p className='max-w-md text-sm text-white/80'>{cta_section.description}</p>
					<Link to={paths.client.shop} viewTransition>
						<Button variant='dark'>{cta_section.btn_text}</Button>
					</Link>
				</div>
			</section>
		</div>
	);
};

export default AboutPage;
