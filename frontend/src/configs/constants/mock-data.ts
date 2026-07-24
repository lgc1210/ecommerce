export type MockCategory = {
	slug: string;
	name: string;
	image: string;
	productCount: number;
};

export type MockProduct = {
	slug: string;
	name: string;
	categorySlug: string;
	price: number;
	oldPrice?: number;
	rating: number;
	reviewCount: number;
	inStock: boolean;
	image: string;
	gallery: string[];
	shortDescription: string;
	description: string;
};

const placeholder = (label: string, size = "600x600") =>
	`https://placehold.co/${size}/f3ede4/1c1815?font=montserrat&text=${encodeURIComponent(label)}`;

export const mockCategories: MockCategory[] = [
	{
		slug: "loa-tai-nghe",
		name: "Loa & Tai nghe",
		image: placeholder("Loa & Tai nghe"),
		productCount: 24,
	},
	{
		slug: "dong-ho-thong-minh",
		name: "Đồng hồ thông minh",
		image: placeholder("Đồng hồ"),
		productCount: 16,
	},
	{
		slug: "tay-cam-choi-game",
		name: "Tay cầm chơi game",
		image: placeholder("Tay cầm"),
		productCount: 12,
	},
	{
		slug: "am-thanh-hinh-anh",
		name: "Âm thanh & Hình ảnh",
		image: placeholder("Âm thanh"),
		productCount: 19,
	},
	{
		slug: "thuc-te-ao",
		name: "Thực tế ảo",
		image: placeholder("VR"),
		productCount: 8,
	},
];

export const mockProducts: MockProduct[] = [
	{
		slug: "tai-nghe-chup-tai-xanh",
		name: "Tai nghe chụp tai Aurora Blue",
		categorySlug: "loa-tai-nghe",
		price: 1890000,
		oldPrice: 2290000,
		rating: 4.6,
		reviewCount: 128,
		inStock: true,
		image: placeholder("Tai nghe Aurora"),
		gallery: [
			placeholder("Tai nghe 1"),
			placeholder("Tai nghe 2"),
			placeholder("Tai nghe 3"),
		],
		shortDescription:
			"Âm bass sâu, chống ồn chủ động, đệm tai êm ái cho cả ngày dài.",
		description:
			"Tai nghe chụp tai Aurora Blue mang lại trải nghiệm nghe nhạc sống động với driver 40mm, công nghệ chống ồn chủ động ANC và thời lượng pin lên đến 30 giờ. Thiết kế gấp gọn tiện lợi mang theo mọi nơi.",
	},
	{
		slug: "loa-thong-minh-tron",
		name: "Loa thông minh Orbit",
		categorySlug: "am-thanh-hinh-anh",
		price: 3190000,
		rating: 4.8,
		reviewCount: 84,
		inStock: true,
		image: placeholder("Loa Orbit"),
		gallery: [placeholder("Loa 1"), placeholder("Loa 2"), placeholder("Loa 3")],
		shortDescription: "Trợ lý giọng nói, âm thanh 360°, kết nối đa phòng.",
		description:
			"Loa thông minh Orbit tích hợp trợ lý ảo, hỗ trợ điều khiển giọng nói và kết nối đồng bộ nhiều loa trong nhà. Âm thanh 360 độ lấp đầy không gian, thiết kế tối giản phù hợp mọi nội thất.",
	},
	{
		slug: "kinh-thuc-te-ao-vr",
		name: "Kính thực tế ảo Nova VR",
		categorySlug: "thuc-te-ao",
		price: 4590000,
		oldPrice: 5290000,
		rating: 4.4,
		reviewCount: 41,
		inStock: true,
		image: placeholder("Nova VR"),
		gallery: [placeholder("VR 1"), placeholder("VR 2"), placeholder("VR 3")],
		shortDescription: "Độ phân giải 2K mỗi mắt, chuyển động mượt mà, đeo êm.",
		description:
			"Nova VR mang đến trải nghiệm nhập vai với độ phân giải sắc nét, góc nhìn rộng 110 độ và cảm biến chuyển động chính xác. Đệm mút mềm giúp đeo thoải mái trong các phiên chơi dài.",
	},
	{
		slug: "tai-nghe-nhet-tai-khong-day",
		name: "Tai nghe nhét tai không dây Pulse",
		categorySlug: "loa-tai-nghe",
		price: 990000,
		rating: 4.3,
		reviewCount: 210,
		inStock: false,
		image: placeholder("Tai nghe Pulse"),
		gallery: [
			placeholder("Pulse 1"),
			placeholder("Pulse 2"),
			placeholder("Pulse 3"),
		],
		shortDescription: "Nhỏ gọn, chống nước IPX5, pin 24 giờ kèm hộp sạc.",
		description:
			"Pulse là mẫu tai nghe true wireless nhỏ gọn, chuẩn chống nước IPX5 phù hợp vận động ngoài trời. Hộp sạc tích hợp cho tổng thời lượng sử dụng lên đến 24 giờ.",
	},
	{
		slug: "dong-ho-thong-minh-nam",
		name: "Đồng hồ thông minh Flux Nam",
		categorySlug: "dong-ho-thong-minh",
		price: 2490000,
		rating: 4.7,
		reviewCount: 156,
		inStock: true,
		image: placeholder("Flux Nam"),
		gallery: [
			placeholder("Flux 1"),
			placeholder("Flux 2"),
			placeholder("Flux 3"),
		],
		shortDescription: "Theo dõi sức khoẻ 24/7, pin 10 ngày, chống nước 5ATM.",
		description:
			"Flux theo dõi nhịp tim, giấc ngủ và hoạt động thể thao suốt cả ngày. Thời lượng pin lên đến 10 ngày sử dụng và khả năng chống nước 5ATM cho phép đeo khi bơi lội.",
	},
	{
		slug: "tay-cam-choi-game-khong-day",
		name: "Tay cầm chơi game Strike Pro",
		categorySlug: "tay-cam-choi-game",
		price: 1290000,
		oldPrice: 1490000,
		rating: 4.5,
		reviewCount: 97,
		inStock: true,
		image: placeholder("Strike Pro"),
		gallery: [
			placeholder("Strike 1"),
			placeholder("Strike 2"),
			placeholder("Strike 3"),
		],
		shortDescription: "Phản hồi rung kép, kết nối không dây độ trễ thấp.",
		description:
			"Strike Pro trang bị hệ thống rung phản hồi kép, các nút bấm phản hồi nhanh và kết nối không dây độ trễ thấp, tương thích với hầu hết các nền tảng chơi game phổ biến.",
	},
	{
		slug: "dong-ho-thong-minh-nu",
		name: "Đồng hồ thông minh Flux Nữ",
		categorySlug: "dong-ho-thong-minh",
		price: 2290000,
		rating: 4.6,
		reviewCount: 88,
		inStock: true,
		image: placeholder("Flux Nữ"),
		gallery: [
			placeholder("Flux Nữ 1"),
			placeholder("Flux Nữ 2"),
			placeholder("Flux Nữ 3"),
		],
		shortDescription:
			"Thiết kế mảnh nhẹ, mặt kính cường lực, nhiều mặt đồng hồ.",
		description:
			"Phiên bản Flux dành cho phái nữ với thiết kế mảnh nhẹ, mặt kính cường lực chống trầy và thư viện mặt đồng hồ đa dạng để cá nhân hoá theo phong cách riêng.",
	},
	{
		slug: "loa-di-dong-mini",
		name: "Loa di động Mini Beat",
		categorySlug: "am-thanh-hinh-anh",
		price: 690000,
		rating: 4.2,
		reviewCount: 63,
		inStock: true,
		image: placeholder("Mini Beat"),
		gallery: [
			placeholder("Mini 1"),
			placeholder("Mini 2"),
			placeholder("Mini 3"),
		],
		shortDescription: "Bỏ túi gọn nhẹ, chống nước IPX7, pin 12 giờ.",
		description:
			"Mini Beat nhỏ gọn bỏ vừa túi xách, đạt chuẩn chống nước IPX7 và cho thời lượng nghe nhạc liên tục lên đến 12 giờ — người bạn đồng hành lý tưởng cho các chuyến đi.",
	},
];

export const getProductBySlug = (slug: string): MockProduct | undefined =>
	mockProducts.find((product) => product.slug === slug);

export const getRelatedProducts = (
	product: MockProduct,
	limit = 4,
): MockProduct[] =>
	mockProducts
		.filter(
			(p) => p.categorySlug === product.categorySlug && p.slug !== product.slug,
		)
		.slice(0, limit);
