import { Link } from "react-router-dom";
import BreadCrumb from "../../components/breadcrumb";
import Button from "../../components/button";
import paths from "../../configs/constants/paths";
import { HeadsetIcon, ShieldCheckIcon, TruckIcon } from "../../components/icons";
import { useEffect, useState } from "react";
import axios from "axios";

const stats = [
	{ value: "10K+", label: "Khách hàng hài lòng" },
	{ value: "500+", label: "Sản phẩm đa dạng" },
	{ value: "24/7", label: "Hỗ trợ trực tuyến" },
	{ value: "8", label: "Năm kinh nghiệm" },
];

const values = [
	{
		icon: ShieldCheckIcon,
		title: "Chất lượng đảm bảo",
		description: "Mọi sản phẩm đều được kiểm định kỹ lưỡng trước khi đến tay khách hàng.",
	},
	{
		icon: TruckIcon,
		title: "Giao hàng nhanh chóng",
		description: "Hệ thống kho vận rộng khắp giúp đơn hàng đến tay bạn trong thời gian ngắn nhất.",
	},
	{
		icon: HeadsetIcon,
		title: "Chăm sóc tận tâm",
		description: "Đội ngũ tư vấn viên luôn sẵn sàng đồng hành cùng bạn trước và sau khi mua hàng.",
	},
];

const AboutPage = () => {
	const [bannerUrl, setBannerUrl] = useState(
		"https://placehold.co/700x560/f3ede4/1c1815?font=montserrat&text=Ecommerce+Story",
	);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchBanner = async () => {
			try {
				const response = await axios.get("http://localhost:1337/api/about-banner?populate=*");
				console.log("response: ", response);
				const data = response.data;
				console.log("url: ", data?.data?.Banner?.url);

				if (data?.data?.Banner?.url) {
					const url = `http://localhost:1337${data.data.Banner.url}`;
					setBannerUrl(url);
				}
			} catch (error) {
				console.error("Error fetching banner:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchBanner();
	}, []);

	if (loading) return <div>Đang tải ảnh từ CMS...</div>;

	return (
		<div>
			<BreadCrumb title='Giới thiệu' description='Câu chuyện của Ecommerce và những giá trị chúng tôi theo đuổi.' />

			{/* Story */}
			<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
				<div className='grid items-center gap-10 lg:grid-cols-2'>
					<div className='overflow-hidden rounded-3xl bg-cream-soft min-h-96 h-full'>
						<img src={bannerUrl} alt='Câu chuyện Ecommerce' className='w-full h-full object-cover' />
					</div>
					<div>
						<span className='text-xs font-bold uppercase tracking-wider text-primary-dark'>Về chúng tôi</span>
						<h2 className='mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>
							Mang công nghệ đến gần hơn với cuộc sống của bạn
						</h2>
						<p className='mt-5 leading-relaxed text-muted'>
							Ecommerce ra đời với mong muốn mang đến những thiết bị công nghệ và phụ kiện chất lượng cao, thiết kế tinh
							gọn nhưng vẫn giữ mức giá hợp lý cho người dùng Việt Nam. Chúng tôi tuyển chọn kỹ càng từng sản phẩm, đảm
							bảo trải nghiệm mua sắm trọn vẹn từ lúc đặt hàng đến khi sử dụng.
						</p>
						<p className='mt-4 leading-relaxed text-muted'>
							Từ những ngày đầu chỉ với vài dòng sản phẩm âm thanh, đến nay Ecommerce đã mở rộng danh mục sang thiết bị
							đeo thông minh, phụ kiện chơi game và thực tế ảo — luôn đồng hành cùng xu hướng công nghệ mới nhất.
						</p>
						<Link to={paths.client.shop}>
							<Button className='mt-6'>Khám phá sản phẩm</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Stats */}
			<section className='border-y border-border bg-ink'>
				<div className='mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 text-center sm:px-6 lg:grid-cols-4 lg:px-8'>
					{stats.map((stat) => (
						<div key={stat.label}>
							<p className='text-3xl font-extrabold text-primary sm:text-4xl'>{stat.value}</p>
							<p className='mt-2 text-sm text-cream/60'>{stat.label}</p>
						</div>
					))}
				</div>
			</section>

			{/* Values */}
			<section className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
				<div className='text-center'>
					<h2 className='text-2xl font-extrabold tracking-tight text-ink sm:text-3xl'>Vì sao chọn Ecommerce</h2>
					<p className='mx-auto mt-2 max-w-md text-sm text-muted'>
						Ba giá trị cốt lõi chúng tôi theo đuổi trong từng đơn hàng.
					</p>
				</div>
				<div className='mt-10 grid gap-6 sm:grid-cols-3'>
					{values.map(({ icon: Icon, title, description }) => (
						<div key={title} className='rounded-2xl border border-border bg-surface p-7 text-center'>
							<span className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary-dark'>
								<Icon className='h-7 w-7' />
							</span>
							<h3 className='mt-5 font-bold text-ink'>{title}</h3>
							<p className='mt-2 text-sm leading-relaxed text-muted'>{description}</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA */}
			<section className='border-t border-border bg-primary'>
				<div className='mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-14 text-center sm:px-6 lg:px-8'>
					<h2 className='text-2xl font-extrabold tracking-tight text-white sm:text-3xl'>
						Sẵn sàng nâng cấp thiết bị của bạn?
					</h2>
					<p className='max-w-md text-sm text-white/80'>
						Khám phá bộ sưu tập mới nhất và nhận ưu đãi hấp dẫn ngay hôm nay.
					</p>
					<Link to={paths.client.shop}>
						<Button variant='dark'>Mua sắm ngay</Button>
					</Link>
				</div>
			</section>
		</div>
	);
};

export default AboutPage;
