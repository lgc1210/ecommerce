import prisma from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/index.js";
import { slugify } from "../../utils/index.js";
import { categorySeed } from "../categories/category.seed.js";

interface SeedSkuInput {
	sku: string;
	price: number;
	stockQuantity: number;
	variationDetails: Record<string, string>;
}

interface SeedProductInput {
	name: string;
	description: string;
	categoryName: string;
	isActive?: boolean;
	skus: SeedSkuInput[];
}

/**
 * Sinh URL ảnh placeholder có hiển thị TRỰC TIẾP tên sản phẩm/biến thể trên ảnh
 * (qua dịch vụ placehold.co), thay vì ảnh ngẫu nhiên không liên quan (picsum.photos trước đây).
 * Nhờ vậy ảnh luôn khớp đúng với tên sản phẩm dù không phải ảnh chụp thật.
 */
const buildPlaceholderImageUrl = (text: string): string =>
	`https://placehold.co/800x800/EDE7DD/3A3226?font=roboto&text=${encodeURIComponent(text)}`;

const seedProducts: SeedProductInput[] = [
	{
		name: "iPhone 15",
		description: "Điện thoại Apple iPhone 15, chip A16 Bionic, camera kép 48MP, màn hình Super Retina XDR 6.1 inch.",
		categoryName: "Điện Thoại",
		skus: [
			{
				sku: "IPHONE-15-128GB-EN",
				price: 21990000,
				stockQuantity: 24,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Đen" },
			},
			{
				sku: "IPHONE-15-256GB-XAN",
				price: 21990000,
				stockQuantity: 31,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Xanh" },
			},
			{
				sku: "IPHONE-15-128GB-HON",
				price: 21990000,
				stockQuantity: 38,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Hồng" },
			},
		],
	},
	{
		name: "iPhone 15 Pro Max",
		description: "Điện thoại Apple iPhone 15 Pro Max, chip A17 Pro, khung Titan, camera 48MP zoom quang 5x.",
		categoryName: "Điện Thoại",
		skus: [
			{
				sku: "IPHONE-15-PRO--256GB-TIT",
				price: 34990000,
				stockQuantity: 22,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Titan Tự Nhiên" },
			},
			{
				sku: "IPHONE-15-PRO--512GB-TIT",
				price: 34990000,
				stockQuantity: 29,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Titan Xanh" },
			},
		],
	},
	{
		name: "Samsung Galaxy S24",
		description:
			"Điện thoại Samsung Galaxy S24, chip Exynos 2400, màn hình Dynamic AMOLED 2X 6.2 inch, tích hợp Galaxy AI.",
		categoryName: "Điện Thoại",
		skus: [
			{
				sku: "SAMSUNG-GALAXY-128GB-EN",
				price: 19990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Đen" },
			},
			{
				sku: "SAMSUNG-GALAXY-256GB-TIM",
				price: 19990000,
				stockQuantity: 30,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Tím" },
			},
			{
				sku: "SAMSUNG-GALAXY-128GB-VAN",
				price: 19990000,
				stockQuantity: 37,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Vàng" },
			},
		],
	},
	{
		name: "Samsung Galaxy S24 Ultra",
		description: "Điện thoại Samsung Galaxy S24 Ultra, khung Titan, bút S-Pen, camera 200MP, màn hình 6.8 inch QHD+.",
		categoryName: "Điện Thoại",
		skus: [
			{
				sku: "SAMSUNG-GALAXY-256GB-EN-",
				price: 33990000,
				stockQuantity: 19,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Đen Titan" },
			},
			{
				sku: "SAMSUNG-GALAXY-512GB-XAM",
				price: 33990000,
				stockQuantity: 26,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Xám Titan" },
			},
		],
	},
	{
		name: "Xiaomi 14",
		description: "Điện thoại Xiaomi 14, chip Snapdragon 8 Gen 3, camera Leica, sạc nhanh 90W.",
		categoryName: "Điện Thoại",
		skus: [
			{
				sku: "XIAOMI-14-256GB-EN",
				price: 17990000,
				stockQuantity: 24,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Đen" },
			},
			{
				sku: "XIAOMI-14-512GB-TRA",
				price: 17990000,
				stockQuantity: 31,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Trắng" },
			},
		],
	},
	{
		name: "OPPO Find X7",
		description: "Điện thoại OPPO Find X7, cảm biến Hasselblad, chip Dimensity 9300, sạc nhanh 100W.",
		categoryName: "Điện Thoại",
		skus: [
			{
				sku: "OPPO-FIND-X7-256GB-EN",
				price: 16990000,
				stockQuantity: 17,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Đen" },
			},
			{
				sku: "OPPO-FIND-X7-256GB-XAN",
				price: 16990000,
				stockQuantity: 24,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Xanh Ngọc" },
			},
		],
	},
	{
		name: "Vivo V30",
		description: "Điện thoại Vivo V30, camera chân dung Aura Light, thiết kế mỏng nhẹ, pin 5500mAh.",
		categoryName: "Điện Thoại",
		skus: [
			{
				sku: "VIVO-V30-128GB-XAN",
				price: 9990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Xanh" },
			},
			{
				sku: "VIVO-V30-256GB-TIM",
				price: 9990000,
				stockQuantity: 30,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Tím" },
			},
		],
	},
	{
		name: "Realme 12 Pro+",
		description: "Điện thoại Realme 12 Pro+, camera periscope zoom quang 3x, thiết kế da vegan cao cấp.",
		categoryName: "Điện Thoại",
		skus: [
			{
				sku: "REALME-12-PRO-256GB-NAU",
				price: 8990000,
				stockQuantity: 19,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Nâu" },
			},
			{
				sku: "REALME-12-PRO-256GB-XAN",
				price: 8990000,
				stockQuantity: 26,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Xanh Dương" },
			},
		],
	},
	{
		name: "Google Pixel 8",
		description: "Điện thoại Google Pixel 8, chip Tensor G3, camera AI xử lý ảnh vượt trội, Android thuần.",
		categoryName: "Điện Thoại",
		skus: [
			{
				sku: "GOOGLE-PIXEL-8-128GB-EN",
				price: 15990000,
				stockQuantity: 19,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Đen" },
			},
			{
				sku: "GOOGLE-PIXEL-8-256GB-TRA",
				price: 15990000,
				stockQuantity: 26,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Trắng Tuyết" },
			},
		],
	},
	{
		name: "MacBook Air M2",
		description: "Laptop Apple MacBook Air 13 inch chip M2, màn hình Liquid Retina, thời lượng pin 18 giờ.",
		categoryName: "Laptop",
		skus: [
			{
				sku: "MACBOOK-AIR-M2-256GB-BAC",
				price: 26990000,
				stockQuantity: 19,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Bạc" },
			},
			{
				sku: "MACBOOK-AIR-M2-512GB-XAM",
				price: 26990000,
				stockQuantity: 26,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Xám" },
			},
		],
	},
	{
		name: "MacBook Pro 14 M3",
		description: "Laptop Apple MacBook Pro 14 inch chip M3 Pro, màn hình Liquid Retina XDR, hiệu năng đồ hoạ mạnh mẽ.",
		categoryName: "Laptop",
		skus: [
			{
				sku: "MACBOOK-PRO-14-512GB-EN-",
				price: 49990000,
				stockQuantity: 22,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Đen Không Gian" },
			},
			{
				sku: "MACBOOK-PRO-14-1TB-EN-",
				price: 49990000,
				stockQuantity: 29,
				variationDetails: { "Dung lượng": "1TB", "Màu sắc": "Đen Không Gian" },
			},
		],
	},
	{
		name: "Dell XPS 13",
		description: "Laptop Dell XPS 13, vi xử lý Intel Core i7 thế hệ 13, màn hình InfinityEdge 13.4 inch.",
		categoryName: "Laptop",
		skus: [
			{
				sku: "DELL-XPS-13-512GB-BAC",
				price: 32990000,
				stockQuantity: 16,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Bạc" },
			},
			{
				sku: "DELL-XPS-13-512GB-EN",
				price: 32990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "Dell Inspiron 15",
		description: "Laptop Dell Inspiron 15, Intel Core i5, RAM 16GB, phù hợp học tập văn phòng.",
		categoryName: "Laptop",
		skus: [
			{
				sku: "DELL-INSPIRON--512GB-BAC",
				price: 15990000,
				stockQuantity: 21,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "Asus ROG Zephyrus G14",
		description: "Laptop gaming Asus ROG Zephyrus G14, CPU Ryzen 9, GPU RTX 4060, màn hình 165Hz.",
		categoryName: "Laptop",
		skus: [
			{
				sku: "ASUS-ROG-ZEPHY-1TB-EN",
				price: 39990000,
				stockQuantity: 16,
				variationDetails: { "Dung lượng": "1TB", "Màu sắc": "Đen" },
			},
			{
				sku: "ASUS-ROG-ZEPHY-1TB-TRA",
				price: 39990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "1TB", "Màu sắc": "Trắng" },
			},
		],
	},
	{
		name: "Asus Vivobook 15",
		description: "Laptop Asus Vivobook 15, Intel Core i5, thiết kế mỏng nhẹ, phù hợp học tập làm việc.",
		categoryName: "Laptop",
		skus: [
			{
				sku: "ASUS-VIVOBOOK--512GB-BAC",
				price: 13990000,
				stockQuantity: 21,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Bạc" },
			},
			{
				sku: "ASUS-VIVOBOOK--512GB-XAN",
				price: 13990000,
				stockQuantity: 28,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Xanh" },
			},
		],
	},
	{
		name: "HP Pavilion 14",
		description: "Laptop HP Pavilion 14, Intel Core i5, màn hình Full HD, thiết kế thời trang.",
		categoryName: "Laptop",
		skus: [
			{
				sku: "HP-PAVILION-14-512GB-BAC",
				price: 14990000,
				stockQuantity: 19,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Bạc" },
			},
			{
				sku: "HP-PAVILION-14-512GB-VAN",
				price: 14990000,
				stockQuantity: 26,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Vàng Đồng" },
			},
		],
	},
	{
		name: "Lenovo ThinkPad X1 Carbon",
		description: "Laptop Lenovo ThinkPad X1 Carbon, thân máy sợi carbon siêu nhẹ, bảo mật vân tay.",
		categoryName: "Laptop",
		skus: [
			{
				sku: "LENOVO-THINKPA-512GB-EN",
				price: 42990000,
				stockQuantity: 20,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Đen" },
			},
			{
				sku: "LENOVO-THINKPA-1TB-EN",
				price: 42990000,
				stockQuantity: 27,
				variationDetails: { "Dung lượng": "1TB", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "Lenovo Legion 5",
		description: "Laptop gaming Lenovo Legion 5, CPU Ryzen 7, GPU RTX 4060, tản nhiệt Coldfront.",
		categoryName: "Laptop",
		skus: [
			{
				sku: "LENOVO-LEGION--512GB-EN",
				price: 28990000,
				stockQuantity: 20,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "iPad Gen 10",
		description: "Máy tính bảng Apple iPad thế hệ 10, chip A14 Bionic, màn hình Liquid Retina 10.9 inch.",
		categoryName: "Máy Tính Bảng",
		skus: [
			{
				sku: "IPAD-GEN-10-64GB-XAN",
				price: 11990000,
				stockQuantity: 16,
				variationDetails: { "Dung lượng": "64GB", "Màu sắc": "Xanh" },
			},
			{
				sku: "IPAD-GEN-10-256GB-HON",
				price: 11990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Hồng" },
			},
			{
				sku: "IPAD-GEN-10-64GB-BAC",
				price: 11990000,
				stockQuantity: 30,
				variationDetails: { "Dung lượng": "64GB", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "iPad Pro M4",
		description: "Máy tính bảng Apple iPad Pro 11 inch chip M4, màn hình Ultra Retina XDR, hỗ trợ Apple Pencil Pro.",
		categoryName: "Máy Tính Bảng",
		skus: [
			{
				sku: "IPAD-PRO-M4-256GB-EN-",
				price: 28990000,
				stockQuantity: 16,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Đen Không Gian" },
			},
			{
				sku: "IPAD-PRO-M4-512GB-BAC",
				price: 28990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "512GB", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "Samsung Galaxy Tab S9",
		description: "Máy tính bảng Samsung Galaxy Tab S9, màn hình Dynamic AMOLED 2X, kèm bút S-Pen.",
		categoryName: "Máy Tính Bảng",
		skus: [
			{
				sku: "SAMSUNG-GALAXY-128GB-EN2",
				price: 18990000,
				stockQuantity: 16,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Đen" },
			},
			{
				sku: "SAMSUNG-GALAXY-256GB-BE",
				price: 18990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Be" },
			},
		],
	},
	{
		name: "Samsung Galaxy Tab A9+",
		description: "Máy tính bảng Samsung Galaxy Tab A9+, màn hình lớn 11 inch, loa quad Dolby Atmos.",
		categoryName: "Máy Tính Bảng",
		skus: [
			{
				sku: "SAMSUNG-GALAXY-64GB-XAM",
				price: 5990000,
				stockQuantity: 17,
				variationDetails: { "Dung lượng": "64GB", "Màu sắc": "Xám" },
			},
			{
				sku: "SAMSUNG-GALAXY-128GB-BAC",
				price: 5990000,
				stockQuantity: 24,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "Xiaomi Pad 6",
		description: "Máy tính bảng Xiaomi Pad 6, chip Snapdragon 870, màn hình 144Hz, thiết kế mỏng nhẹ.",
		categoryName: "Máy Tính Bảng",
		skus: [
			{
				sku: "XIAOMI-PAD-6-128GB-EN",
				price: 8990000,
				stockQuantity: 17,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Đen" },
			},
			{
				sku: "XIAOMI-PAD-6-256GB-VAN",
				price: 8990000,
				stockQuantity: 24,
				variationDetails: { "Dung lượng": "256GB", "Màu sắc": "Vàng" },
			},
		],
	},
	{
		name: "Lenovo Tab P11",
		description: "Máy tính bảng Lenovo Tab P11, màn hình 2K, 4 loa JBL, pin 7700mAh.",
		categoryName: "Máy Tính Bảng",
		skus: [
			{
				sku: "LENOVO-TAB-P11-128GB-XAM",
				price: 6990000,
				stockQuantity: 19,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Xám" },
			},
		],
	},
	{
		name: "Huawei MatePad 11",
		description: "Máy tính bảng Huawei MatePad 11, màn hình 120Hz, hỗ trợ bút M-Pencil.",
		categoryName: "Máy Tính Bảng",
		skus: [
			{
				sku: "HUAWEI-MATEPAD-128GB-XAN",
				price: 9990000,
				stockQuantity: 22,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Xanh" },
			},
		],
	},
	{
		name: "Microsoft Surface Go 3",
		description: "Máy tính bảng 2-in-1 Microsoft Surface Go 3, chạy Windows, kèm bàn phím rời tuỳ chọn.",
		categoryName: "Máy Tính Bảng",
		skus: [
			{
				sku: "MICROSOFT-SURF-128GB-BAC",
				price: 14990000,
				stockQuantity: 17,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "Apple Watch Series 9",
		description: "Đồng hồ thông minh Apple Watch Series 9, chip S9, đo oxy máu, điện tâm đồ ECG.",
		categoryName: "Đồng Hồ Thông Minh",
		skus: [
			{
				sku: "APPLE-WATCH-SE-41MM-EN",
				price: 10990000,
				stockQuantity: 15,
				variationDetails: { "Dung lượng": "41mm", "Màu sắc": "Đen" },
			},
			{
				sku: "APPLE-WATCH-SE-45MM-HON",
				price: 10990000,
				stockQuantity: 22,
				variationDetails: { "Dung lượng": "45mm", "Màu sắc": "Hồng" },
			},
			{
				sku: "APPLE-WATCH-SE-41MM-BAC",
				price: 10990000,
				stockQuantity: 29,
				variationDetails: { "Dung lượng": "41mm", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "Apple Watch Ultra 2",
		description: "Đồng hồ thông minh Apple Watch Ultra 2, khung Titan, chống nước 100m, pin bền bỉ.",
		categoryName: "Đồng Hồ Thông Minh",
		skus: [
			{
				sku: "APPLE-WATCH-UL-49MM-TIT",
				price: 21990000,
				stockQuantity: 24,
				variationDetails: { "Dung lượng": "49mm", "Màu sắc": "Titan" },
			},
		],
	},
	{
		name: "Samsung Galaxy Watch 6",
		description: "Đồng hồ thông minh Samsung Galaxy Watch 6, mặt kính Sapphire, đo giấc ngủ nâng cao.",
		categoryName: "Đồng Hồ Thông Minh",
		skus: [
			{
				sku: "SAMSUNG-GALAXY-40MM-EN",
				price: 7990000,
				stockQuantity: 17,
				variationDetails: { "Dung lượng": "40mm", "Màu sắc": "Đen" },
			},
			{
				sku: "SAMSUNG-GALAXY-44MM-BAC",
				price: 7990000,
				stockQuantity: 24,
				variationDetails: { "Dung lượng": "44mm", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "Xiaomi Watch S3",
		description: "Đồng hồ thông minh Xiaomi Watch S3, mặt kính có thể thay đổi, pin 15 ngày.",
		categoryName: "Đồng Hồ Thông Minh",
		skus: [
			{
				sku: "XIAOMI-WATCH-S-46MM-EN",
				price: 3490000,
				stockQuantity: 20,
				variationDetails: { "Dung lượng": "46mm", "Màu sắc": "Đen" },
			},
			{
				sku: "XIAOMI-WATCH-S-46MM-BAC",
				price: 3490000,
				stockQuantity: 27,
				variationDetails: { "Dung lượng": "46mm", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "Garmin Forerunner 265",
		description: "Đồng hồ chạy bộ Garmin Forerunner 265, GPS chính xác, màn hình AMOLED.",
		categoryName: "Đồng Hồ Thông Minh",
		skus: [
			{
				sku: "GARMIN-FORERUN-46MM-EN",
				price: 12990000,
				stockQuantity: 16,
				variationDetails: { "Dung lượng": "46mm", "Màu sắc": "Đen" },
			},
			{
				sku: "GARMIN-FORERUN-46MM-TRA",
				price: 12990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "46mm", "Màu sắc": "Trắng" },
			},
		],
	},
	{
		name: "Huawei Watch GT 4",
		description: "Đồng hồ thông minh Huawei Watch GT 4, pin 2 tuần, theo dõi sức khoẻ toàn diện.",
		categoryName: "Đồng Hồ Thông Minh",
		skus: [
			{
				sku: "HUAWEI-WATCH-G-41MM-EN",
				price: 5990000,
				stockQuantity: 22,
				variationDetails: { "Dung lượng": "41mm", "Màu sắc": "Đen" },
			},
			{
				sku: "HUAWEI-WATCH-G-46MM-VAN",
				price: 5990000,
				stockQuantity: 29,
				variationDetails: { "Dung lượng": "46mm", "Màu sắc": "Vàng" },
			},
		],
	},
	{
		name: "Amazfit GTS 4",
		description: "Đồng hồ thông minh Amazfit GTS 4, thiết kế mỏng nhẹ, hơn 150 chế độ luyện tập.",
		categoryName: "Đồng Hồ Thông Minh",
		skus: [
			{
				sku: "AMAZFIT-GTS-4-44MM-EN",
				price: 3990000,
				stockQuantity: 18,
				variationDetails: { "Dung lượng": "44mm", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "Fitbit Versa 4",
		description: "Đồng hồ thông minh Fitbit Versa 4, theo dõi nhịp tim 24/7, pin 6 ngày.",
		categoryName: "Đồng Hồ Thông Minh",
		skus: [
			{
				sku: "FITBIT-VERSA-4-40MM-EN",
				price: 4990000,
				stockQuantity: 19,
				variationDetails: { "Dung lượng": "40mm", "Màu sắc": "Đen" },
			},
			{
				sku: "FITBIT-VERSA-4-40MM-XAN",
				price: 4990000,
				stockQuantity: 26,
				variationDetails: { "Dung lượng": "40mm", "Màu sắc": "Xanh" },
			},
		],
	},
	{
		name: "AirPods Pro 2",
		description: "Tai nghe Apple AirPods Pro thế hệ 2, chống ồn chủ động, chip H2, hộp sạc MagSafe.",
		categoryName: "Tai Nghe",
		skus: [
			{
				sku: "AIRPODS-PRO-2-USBC-TRA",
				price: 5990000,
				stockQuantity: 18,
				variationDetails: { "Dung lượng": "USB-C", "Màu sắc": "Trắng" },
			},
		],
	},
	{
		name: "AirPods Max",
		description: "Tai nghe chụp tai Apple AirPods Max, âm thanh không gian, chống ồn chủ động cao cấp.",
		categoryName: "Tai Nghe",
		skus: [
			{
				sku: "AIRPODS-MAX-STD-XAM",
				price: 13990000,
				stockQuantity: 16,
				variationDetails: { "Màu sắc": "Xám Không Gian" },
			},
			{ sku: "AIRPODS-MAX-STD-BAC", price: 13990000, stockQuantity: 23, variationDetails: { "Màu sắc": "Bạc" } },
			{ sku: "AIRPODS-MAX-STD-XAN", price: 13990000, stockQuantity: 30, variationDetails: { "Màu sắc": "Xanh" } },
		],
	},
	{
		name: "Sony WH-1000XM5",
		description: "Tai nghe chụp tai Sony WH-1000XM5, chống ồn hàng đầu, pin 30 giờ.",
		categoryName: "Tai Nghe",
		skus: [
			{ sku: "SONY-WH-1000XM-STD-EN", price: 8490000, stockQuantity: 20, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "SONY-WH-1000XM-STD-BAC", price: 8490000, stockQuantity: 27, variationDetails: { "Màu sắc": "Bạc" } },
		],
	},
	{
		name: "Sony WF-1000XM5",
		description: "Tai nghe True Wireless Sony WF-1000XM5, chống ồn chủ động, chất âm Hi-Res.",
		categoryName: "Tai Nghe",
		skus: [
			{ sku: "SONY-WF-1000XM-STD-EN", price: 6490000, stockQuantity: 20, variationDetails: { "Màu sắc": "Đen" } },
			{
				sku: "SONY-WF-1000XM-STD-VAN",
				price: 6490000,
				stockQuantity: 27,
				variationDetails: { "Màu sắc": "Vàng Đồng" },
			},
		],
	},
	{
		name: "Samsung Galaxy Buds2 Pro",
		description: "Tai nghe True Wireless Samsung Galaxy Buds2 Pro, chống ồn thông minh, âm thanh 24bit Hi-Fi.",
		categoryName: "Tai Nghe",
		skus: [
			{ sku: "SAMSUNG-GALAXY-STD-EN", price: 4490000, stockQuantity: 19, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "SAMSUNG-GALAXY-STD-TIM", price: 4490000, stockQuantity: 26, variationDetails: { "Màu sắc": "Tím" } },
			{ sku: "SAMSUNG-GALAXY-STD-TRA", price: 4490000, stockQuantity: 33, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "JBL Tune 760NC",
		description: "Tai nghe chụp tai JBL Tune 760NC, chống ồn chủ động, pin 50 giờ, gập gọn.",
		categoryName: "Tai Nghe",
		skus: [
			{ sku: "JBL-TUNE-760NC-STD-EN", price: 1990000, stockQuantity: 19, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "JBL-TUNE-760NC-STD-XAN", price: 1990000, stockQuantity: 26, variationDetails: { "Màu sắc": "Xanh" } },
			{ sku: "JBL-TUNE-760NC-STD-TRA", price: 1990000, stockQuantity: 33, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Bose QuietComfort Ultra",
		description: "Tai nghe chụp tai Bose QuietComfort Ultra, chống ồn đẳng cấp, âm thanh không gian immersive.",
		categoryName: "Tai Nghe",
		skus: [
			{ sku: "BOSE-QUIETCOMF-STD-EN", price: 9990000, stockQuantity: 18, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "BOSE-QUIETCOMF-STD-TRA", price: 9990000, stockQuantity: 25, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Anker Soundcore Liberty 4",
		description: "Tai nghe True Wireless Anker Soundcore Liberty 4, đo nhịp tim, chống ồn thích ứng.",
		categoryName: "Tai Nghe",
		skus: [
			{ sku: "ANKER-SOUNDCOR-STD-EN", price: 2490000, stockQuantity: 20, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "ANKER-SOUNDCOR-STD-XAN", price: 2490000, stockQuantity: 27, variationDetails: { "Màu sắc": "Xanh" } },
		],
	},
	{
		name: "Marshall Motif II",
		description: "Tai nghe True Wireless Marshall Motif II, thiết kế cổ điển, chống ồn chủ động ANC.",
		categoryName: "Tai Nghe",
		skus: [{ sku: "MARSHALL-MOTIF-STD-EN", price: 4990000, stockQuantity: 22, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "JBL Flip 6",
		description: "Loa Bluetooth JBL Flip 6, chống nước IP67, âm bass mạnh mẽ, pin 12 giờ.",
		categoryName: "Loa Bluetooth",
		skus: [
			{ sku: "JBL-FLIP-6-STD-EN", price: 2790000, stockQuantity: 15, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "JBL-FLIP-6-STD-O", price: 2790000, stockQuantity: 22, variationDetails: { "Màu sắc": "Đỏ" } },
			{ sku: "JBL-FLIP-6-STD-XAN", price: 2790000, stockQuantity: 29, variationDetails: { "Màu sắc": "Xanh" } },
		],
	},
	{
		name: "JBL Charge 5",
		description: "Loa Bluetooth JBL Charge 5, tích hợp sạc dự phòng, chống nước bụi IP67.",
		categoryName: "Loa Bluetooth",
		skus: [
			{ sku: "JBL-CHARGE-5-STD-EN", price: 4290000, stockQuantity: 17, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "JBL-CHARGE-5-STD-XAN", price: 4290000, stockQuantity: 24, variationDetails: { "Màu sắc": "Xanh Dương" } },
		],
	},
	{
		name: "Marshall Emberton II",
		description: "Loa Bluetooth Marshall Emberton II, thiết kế cổ điển, chống nước IP67, pin 24 giờ.",
		categoryName: "Loa Bluetooth",
		skus: [
			{ sku: "MARSHALL-EMBER-STD-EN", price: 3990000, stockQuantity: 15, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "MARSHALL-EMBER-STD-KEM", price: 3990000, stockQuantity: 22, variationDetails: { "Màu sắc": "Kem" } },
		],
	},
	{
		name: "Sony SRS-XB100",
		description: "Loa Bluetooth Sony SRS-XB100, nhỏ gọn, âm bass sâu, chống nước IP67.",
		categoryName: "Loa Bluetooth",
		skus: [
			{ sku: "SONY-SRS-XB100-STD-EN", price: 1290000, stockQuantity: 19, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "SONY-SRS-XB100-STD-XAN", price: 1290000, stockQuantity: 26, variationDetails: { "Màu sắc": "Xanh" } },
			{ sku: "SONY-SRS-XB100-STD-HON", price: 1290000, stockQuantity: 33, variationDetails: { "Màu sắc": "Hồng" } },
		],
	},
	{
		name: "Bose SoundLink Flex",
		description: "Loa Bluetooth Bose SoundLink Flex, chống nước bụi IP67, thiết kế nổi trên nước.",
		categoryName: "Loa Bluetooth",
		skus: [
			{ sku: "BOSE-SOUNDLINK-STD-EN", price: 4990000, stockQuantity: 24, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "BOSE-SOUNDLINK-STD-TRA", price: 4990000, stockQuantity: 31, variationDetails: { "Màu sắc": "Trắng Đá" } },
		],
	},
	{
		name: "Anker Soundcore Motion+",
		description: "Loa Bluetooth Anker Soundcore Motion+, âm thanh Hi-Res, driver kép, chống nước IPX7.",
		categoryName: "Loa Bluetooth",
		skus: [
			{ sku: "ANKER-SOUNDCOR-STD-EN2", price: 2190000, stockQuantity: 18, variationDetails: { "Màu sắc": "Đen" } },
		],
	},
	{
		name: "Harman Kardon Onyx Studio 8",
		description: "Loa Bluetooth Harman Kardon Onyx Studio 8, thiết kế sang trọng, âm thanh 360 độ.",
		categoryName: "Loa Bluetooth",
		skus: [
			{ sku: "HARMAN-KARDON--STD-EN", price: 5490000, stockQuantity: 22, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "HARMAN-KARDON--STD-XAN", price: 5490000, stockQuantity: 29, variationDetails: { "Màu sắc": "Xanh" } },
		],
	},
	{
		name: "Sony SRS-XG300",
		description: "Loa Bluetooth di động Sony SRS-XG300, đèn LED hiệu ứng, chống nước bụi IP67.",
		categoryName: "Loa Bluetooth",
		skus: [{ sku: "SONY-SRS-XG300-STD-EN", price: 6990000, stockQuantity: 19, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "Keychron K8 Pro",
		description: "Bàn phím cơ Keychron K8 Pro, kết nối không dây/bluetooth, hotswap switch, layout 87 phím.",
		categoryName: "Bàn Phím Cơ",
		skus: [{ sku: "KEYCHRON-K8-PR-STD-EN", price: 2490000, stockQuantity: 20, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "Logitech G Pro X",
		description: "Bàn phím cơ gaming Logitech G Pro X, switch hotswap, thiết kế TKL nhỏ gọn cho thi đấu.",
		categoryName: "Bàn Phím Cơ",
		skus: [{ sku: "LOGITECH-G-PRO-STD-EN", price: 3290000, stockQuantity: 21, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "Razer BlackWidow V4",
		description: "Bàn phím cơ gaming Razer BlackWidow V4, switch Green clicky, đèn RGB Chroma.",
		categoryName: "Bàn Phím Cơ",
		skus: [{ sku: "RAZER-BLACKWID-STD-EN", price: 3990000, stockQuantity: 24, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "Akko 3068B Plus",
		description: "Bàn phím cơ Akko 3068B Plus, kết nối 3 chế độ, keycap PBT double-shot.",
		categoryName: "Bàn Phím Cơ",
		skus: [
			{
				sku: "AKKO-3068B-PLU-STD-TRA",
				price: 1690000,
				stockQuantity: 20,
				variationDetails: { "Màu sắc": "Trắng Kem" },
			},
			{ sku: "AKKO-3068B-PLU-STD-EN", price: 1690000, stockQuantity: 27, variationDetails: { "Màu sắc": "Đen" } },
		],
	},
	{
		name: "Corsair K70 RGB Pro",
		description: "Bàn phím cơ gaming Corsair K70 RGB Pro, switch Cherry MX, khung nhôm nguyên khối.",
		categoryName: "Bàn Phím Cơ",
		skus: [{ sku: "CORSAIR-K70-RG-STD-EN", price: 4290000, stockQuantity: 24, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "Ducky One 3",
		description: "Bàn phím cơ Ducky One 3, keycap PBT dye-sub, switch Cherry MX chính hãng.",
		categoryName: "Bàn Phím Cơ",
		skus: [
			{ sku: "DUCKY-ONE-3-STD-VAN", price: 2890000, stockQuantity: 16, variationDetails: { "Màu sắc": "Vàng" } },
			{ sku: "DUCKY-ONE-3-STD-TRA", price: 2890000, stockQuantity: 23, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Leopold FC750R",
		description: "Bàn phím cơ Leopold FC750R, độ hoàn thiện cao, âm thanh gõ êm ái.",
		categoryName: "Bàn Phím Cơ",
		skus: [
			{ sku: "LEOPOLD-FC750R-STD-EN", price: 2390000, stockQuantity: 19, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "LEOPOLD-FC750R-STD-XAM", price: 2390000, stockQuantity: 26, variationDetails: { "Màu sắc": "Xám" } },
		],
	},
	{
		name: "Royal Kludge RK84",
		description: "Bàn phím cơ không dây Royal Kludge RK84, kết nối bluetooth đa thiết bị, hotswap.",
		categoryName: "Bàn Phím Cơ",
		skus: [
			{ sku: "ROYAL-KLUDGE-R-STD-EN", price: 1490000, stockQuantity: 22, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "ROYAL-KLUDGE-R-STD-TRA", price: 1490000, stockQuantity: 29, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Logitech G Pro X Superlight",
		description: "Chuột gaming Logitech G Pro X Superlight, siêu nhẹ 63g, cảm biến HERO 25K.",
		categoryName: "Chuột Gaming",
		skus: [
			{ sku: "LOGITECH-G-PRO-STD-EN2", price: 2990000, stockQuantity: 22, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "LOGITECH-G-PRO-STD-TRA", price: 2990000, stockQuantity: 29, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Razer DeathAdder V3",
		description: "Chuột gaming Razer DeathAdder V3, cảm biến Focus Pro 30K, form dáng ergonomic.",
		categoryName: "Chuột Gaming",
		skus: [{ sku: "RAZER-DEATHADD-STD-EN", price: 1990000, stockQuantity: 24, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "SteelSeries Aerox 3",
		description: "Chuột gaming SteelSeries Aerox 3, siêu nhẹ, chống nước IP54, cảm biến TrueMove Air.",
		categoryName: "Chuột Gaming",
		skus: [
			{ sku: "STEELSERIES-AE-STD-EN", price: 1590000, stockQuantity: 24, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "STEELSERIES-AE-STD-TRA", price: 1590000, stockQuantity: 31, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Logitech G502 Hero",
		description: "Chuột gaming Logitech G502 Hero, 11 nút tuỳ biến, cảm biến HERO 25K độ chính xác cao.",
		categoryName: "Chuột Gaming",
		skus: [{ sku: "LOGITECH-G502--STD-EN", price: 1290000, stockQuantity: 23, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "Razer Viper V2 Pro",
		description: "Chuột gaming không dây Razer Viper V2 Pro, siêu nhẹ 58g, switch quang học thế hệ 3.",
		categoryName: "Chuột Gaming",
		skus: [
			{ sku: "RAZER-VIPER-V2-STD-EN", price: 3490000, stockQuantity: 23, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "RAZER-VIPER-V2-STD-TRA", price: 3490000, stockQuantity: 30, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Glorious Model O",
		description: "Chuột gaming Glorious Model O, thiết kế tổ ong siêu nhẹ, cáp Ascended Cord.",
		categoryName: "Chuột Gaming",
		skus: [
			{ sku: "GLORIOUS-MODEL-STD-EN-", price: 1190000, stockQuantity: 21, variationDetails: { "Màu sắc": "Đen Mờ" } },
			{ sku: "GLORIOUS-MODEL-STD-TRA", price: 1190000, stockQuantity: 28, variationDetails: { "Màu sắc": "Trắng Mờ" } },
		],
	},
	{
		name: "Logitech MX Master 3S",
		description: "Chuột văn phòng Logitech MX Master 3S, cuộn MagSpeed, kết nối 3 thiết bị.",
		categoryName: "Chuột Gaming",
		skus: [
			{ sku: "LOGITECH-MX-MA-STD-EN", price: 2390000, stockQuantity: 16, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "LOGITECH-MX-MA-STD-XAM", price: 2390000, stockQuantity: 23, variationDetails: { "Màu sắc": "Xám" } },
		],
	},
	{
		name: "Pulsar X2",
		description: "Chuột gaming Pulsar X2, siêu nhẹ dưới 52g, cảm biến PAW3395 chính xác cao.",
		categoryName: "Chuột Gaming",
		skus: [{ sku: "PULSAR-X2-STD-TRA", price: 1890000, stockQuantity: 24, variationDetails: { "Màu sắc": "Trắng" } }],
	},
	{
		name: "Dell UltraSharp U2723QE",
		description: "Màn hình Dell UltraSharp U2723QE 27 inch 4K IPS Black, chuẩn màu chuyên nghiệp.",
		categoryName: "Màn Hình Máy Tính",
		skus: [
			{
				sku: "DELL-ULTRASHAR-27INCH-EN",
				price: 12990000,
				stockQuantity: 18,
				variationDetails: { "Dung lượng": "27 inch", "Màu sắc": "Đen" },
			},
			{
				sku: "DELL-ULTRASHAR-27INCH-BAC",
				price: 12990000,
				stockQuantity: 25,
				variationDetails: { "Dung lượng": "27 inch", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "LG UltraGear 27GP850",
		description: "Màn hình gaming LG UltraGear 27GP850 27 inch QHD Nano IPS, tần số quét 165Hz.",
		categoryName: "Màn Hình Máy Tính",
		skus: [
			{
				sku: "LG-ULTRAGEAR-2-27INCH-EN",
				price: 8990000,
				stockQuantity: 15,
				variationDetails: { "Dung lượng": "27 inch", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "Samsung Odyssey G7",
		description: "Màn hình gaming Samsung Odyssey G7 32 inch cong 1000R, tần số quét 240Hz.",
		categoryName: "Màn Hình Máy Tính",
		skus: [
			{
				sku: "SAMSUNG-ODYSSE-32INCH-EN",
				price: 13990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "32 inch", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "ASUS TUF Gaming VG27AQ",
		description: "Màn hình gaming Asus TUF VG27AQ 27 inch QHD IPS, 165Hz, hỗ trợ G-Sync.",
		categoryName: "Màn Hình Máy Tính",
		skus: [
			{
				sku: "ASUS-TUF-GAMIN-27INCH-EN",
				price: 7490000,
				stockQuantity: 17,
				variationDetails: { "Dung lượng": "27 inch", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "BenQ PD2705Q",
		description: "Màn hình đồ hoạ BenQ PD2705Q 27 inch QHD, chuẩn màu AQCOLOR cho thiết kế.",
		categoryName: "Màn Hình Máy Tính",
		skus: [
			{
				sku: "BENQ-PD2705Q-27INCH-XAM",
				price: 8490000,
				stockQuantity: 17,
				variationDetails: { "Dung lượng": "27 inch", "Màu sắc": "Xám" },
			},
		],
	},
	{
		name: "ViewSonic VX2758",
		description: "Màn hình gaming ViewSonic VX2758 27 inch Full HD, tần số quét 144Hz, viền mỏng.",
		categoryName: "Màn Hình Máy Tính",
		skus: [
			{
				sku: "VIEWSONIC-VX27-27INCH-EN",
				price: 4290000,
				stockQuantity: 21,
				variationDetails: { "Dung lượng": "27 inch", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "Acer Nitro XV272U",
		description: "Màn hình gaming Acer Nitro XV272U 27 inch QHD IPS, 170Hz, hỗ trợ FreeSync Premium.",
		categoryName: "Màn Hình Máy Tính",
		skus: [
			{
				sku: "ACER-NITRO-XV2-27INCH-EN",
				price: 7990000,
				stockQuantity: 22,
				variationDetails: { "Dung lượng": "27 inch", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "LG 27UP850",
		description: "Màn hình LG 27UP850 27 inch 4K UHD IPS, hỗ trợ HDR10, USB-C 90W.",
		categoryName: "Màn Hình Máy Tính",
		skus: [
			{
				sku: "LG-27UP850-27INCH-BAC",
				price: 9990000,
				stockQuantity: 15,
				variationDetails: { "Dung lượng": "27 inch", "Màu sắc": "Bạc" },
			},
		],
	},
	{
		name: "Samsung SSD 990 Pro",
		description: "Ổ cứng SSD Samsung 990 Pro NVMe M.2 PCIe 4.0, tốc độ đọc lên tới 7450MB/s.",
		categoryName: "Ổ Cứng & Lưu Trữ",
		skus: [
			{ sku: "SAMSUNG-SSD-99-1TB-STD", price: 2790000, stockQuantity: 24, variationDetails: { "Phiên bản": "1TB" } },
			{ sku: "SAMSUNG-SSD-99-2TB-STD", price: 2790000, stockQuantity: 31, variationDetails: { "Phiên bản": "2TB" } },
		],
	},
	{
		name: "WD Black SN850X",
		description: "Ổ cứng SSD WD Black SN850X NVMe, tối ưu cho gaming, tốc độ cao, tản nhiệt tốt.",
		categoryName: "Ổ Cứng & Lưu Trữ",
		skus: [
			{ sku: "WD-BLACK-SN850-1TB-STD", price: 2590000, stockQuantity: 20, variationDetails: { "Phiên bản": "1TB" } },
			{ sku: "WD-BLACK-SN850-2TB-STD", price: 2590000, stockQuantity: 27, variationDetails: { "Phiên bản": "2TB" } },
		],
	},
	{
		name: "Kingston NV2",
		description: "Ổ cứng SSD Kingston NV2 NVMe M.2 PCIe 4.0, giá tốt, hiệu năng ổn định.",
		categoryName: "Ổ Cứng & Lưu Trữ",
		skus: [
			{ sku: "KINGSTON-NV2-500GB-STD", price: 1290000, stockQuantity: 17, variationDetails: { "Phiên bản": "500GB" } },
			{ sku: "KINGSTON-NV2-1TB-STD", price: 1290000, stockQuantity: 24, variationDetails: { "Phiên bản": "1TB" } },
		],
	},
	{
		name: "Seagate Backup Plus 2TB",
		description: "Ổ cứng di động Seagate Backup Plus 2TB, kết nối USB 3.0, thiết kế nhỏ gọn.",
		categoryName: "Ổ Cứng & Lưu Trữ",
		skus: [
			{
				sku: "SEAGATE-BACKUP-2TB-EN",
				price: 1690000,
				stockQuantity: 18,
				variationDetails: { "Dung lượng": "2TB", "Màu sắc": "Đen" },
			},
			{
				sku: "SEAGATE-BACKUP-2TB-O",
				price: 1690000,
				stockQuantity: 25,
				variationDetails: { "Dung lượng": "2TB", "Màu sắc": "Đỏ" },
			},
		],
	},
	{
		name: "SanDisk Extreme Portable SSD",
		description: "Ổ cứng SSD di động SanDisk Extreme, chống nước bụi IP55, tốc độ 1050MB/s.",
		categoryName: "Ổ Cứng & Lưu Trữ",
		skus: [
			{
				sku: "SANDISK-EXTREM-1TB-EN",
				price: 2990000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "1TB", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "Kingston Fury Renegade",
		description: "Ổ cứng SSD Kingston Fury Renegade NVMe, hiệu năng cực cao cho gaming và dựng phim.",
		categoryName: "Ổ Cứng & Lưu Trữ",
		skus: [
			{ sku: "KINGSTON-FURY--1TB-STD", price: 3490000, stockQuantity: 17, variationDetails: { "Phiên bản": "1TB" } },
			{ sku: "KINGSTON-FURY--2TB-STD", price: 3490000, stockQuantity: 24, variationDetails: { "Phiên bản": "2TB" } },
		],
	},
	{
		name: "Crucial P5 Plus",
		description: "Ổ cứng SSD Crucial P5 Plus NVMe PCIe 4.0, tốc độ đọc 6600MB/s, độ bền cao.",
		categoryName: "Ổ Cứng & Lưu Trữ",
		skus: [
			{ sku: "CRUCIAL-P5-PLU-1TB-STD", price: 2390000, stockQuantity: 20, variationDetails: { "Phiên bản": "1TB" } },
		],
	},
	{
		name: "SanDisk Ultra USB 128GB",
		description: "USB SanDisk Ultra 128GB, chuẩn USB 3.2, tốc độ đọc 130MB/s, nhỏ gọn tiện lợi.",
		categoryName: "Ổ Cứng & Lưu Trữ",
		skus: [
			{
				sku: "SANDISK-ULTRA--128GB-EN",
				price: 290000,
				stockQuantity: 18,
				variationDetails: { "Dung lượng": "128GB", "Màu sắc": "Đen" },
			},
			{
				sku: "SANDISK-ULTRA--64GB-EN",
				price: 290000,
				stockQuantity: 25,
				variationDetails: { "Dung lượng": "64GB", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "Anker Sạc Nhanh 65W GaN",
		description: "Củ sạc nhanh Anker 65W công nghệ GaN, 3 cổng ra, nhỏ gọn cho laptop và điện thoại.",
		categoryName: "Phụ Kiện Sạc",
		skus: [
			{ sku: "ANKER-SAC-NHAN-STD-EN", price: 990000, stockQuantity: 18, variationDetails: { "Màu sắc": "Đen" } },
			{ sku: "ANKER-SAC-NHAN-STD-TRA", price: 990000, stockQuantity: 25, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Anker PowerCore 20000mAh",
		description: "Pin sạc dự phòng Anker PowerCore 20000mAh, sạc nhanh PD 20W, 2 cổng ra.",
		categoryName: "Phụ Kiện Sạc",
		skus: [
			{
				sku: "ANKER-POWERCOR-20000M-EN",
				price: 890000,
				stockQuantity: 19,
				variationDetails: { "Dung lượng": "20000mAh", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "Belkin BoostCharge MagSafe",
		description: "Sạc không dây Belkin BoostCharge MagSafe, công suất 15W, tương thích iPhone.",
		categoryName: "Phụ Kiện Sạc",
		skus: [
			{ sku: "BELKIN-BOOSTCH-STD-TRA", price: 1290000, stockQuantity: 21, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Apple MagSafe Charger",
		description: "Sạc không dây chính hãng Apple MagSafe Charger, công suất tối đa 15W.",
		categoryName: "Phụ Kiện Sạc",
		skus: [
			{ sku: "APPLE-MAGSAFE--STD-TRA", price: 990000, stockQuantity: 16, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Baseus GaN 100W",
		description: "Củ sạc nhanh Baseus GaN 100W, 4 cổng ra, sạc đồng thời laptop và nhiều thiết bị.",
		categoryName: "Phụ Kiện Sạc",
		skus: [{ sku: "BASEUS-GAN-100-STD-EN", price: 1490000, stockQuantity: 20, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "Xiaomi Sạc Dự Phòng 10000mAh",
		description: "Pin sạc dự phòng Xiaomi 10000mAh, sạc nhanh hai chiều 22.5W, thiết kế mỏng nhẹ.",
		categoryName: "Phụ Kiện Sạc",
		skus: [
			{
				sku: "XIAOMI-SAC-DU--10000M-EN",
				price: 459000,
				stockQuantity: 23,
				variationDetails: { "Dung lượng": "10000mAh", "Màu sắc": "Đen" },
			},
			{
				sku: "XIAOMI-SAC-DU--10000M-TRA",
				price: 459000,
				stockQuantity: 30,
				variationDetails: { "Dung lượng": "10000mAh", "Màu sắc": "Trắng" },
			},
		],
	},
	{
		name: "Anker Cáp USB-C to USB-C",
		description: "Cáp sạc Anker USB-C to USB-C dài 1.8m, hỗ trợ sạc nhanh 100W, bọc nylon bền bỉ.",
		categoryName: "Phụ Kiện Sạc",
		skus: [
			{
				sku: "ANKER-CAP-USB--18M-EN",
				price: 390000,
				stockQuantity: 19,
				variationDetails: { "Dung lượng": "1.8m", "Màu sắc": "Đen" },
			},
		],
	},
	{
		name: "Ugreen Sạc Xe Hơi 65W",
		description: "Sạc xe hơi Ugreen 65W công nghệ GaN, 2 cổng USB-C PD, sạc nhanh nhiều thiết bị.",
		categoryName: "Phụ Kiện Sạc",
		skus: [{ sku: "UGREEN-SAC-XE--STD-EN", price: 590000, stockQuantity: 16, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "Xiaomi Camera Home 2K",
		description: "Camera an ninh Xiaomi Home 2K, xoay 360 độ, đàm thoại 2 chiều, phát hiện chuyển động AI.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [
			{ sku: "XIAOMI-CAMERA--STD-TRA", price: 690000, stockQuantity: 16, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "Ezviz C6N",
		description: "Camera an ninh Ezviz C6N Full HD, xoay 360 độ, hồng ngoại ban đêm, lưu trữ thẻ nhớ.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [{ sku: "EZVIZ-C6N-STD-TRA", price: 590000, stockQuantity: 24, variationDetails: { "Màu sắc": "Trắng" } }],
	},
	{
		name: "Imou Ranger 2",
		description: "Camera an ninh Imou Ranger 2 1080P, đàm thoại 2 chiều, cảnh báo chuyển động thông minh.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [
			{ sku: "IMOU-RANGER-2-STD-TRA", price: 490000, stockQuantity: 18, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "GoPro HERO12 Black",
		description: "Máy quay hành trình GoPro HERO12 Black, quay 5.3K60, chống nước 10m không cần vỏ.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [
			{ sku: "GOPRO-HERO12-B-STD-EN", price: 10990000, stockQuantity: 23, variationDetails: { "Màu sắc": "Đen" } },
		],
	},
	{
		name: "DJI Osmo Pocket 3",
		description: "Máy quay cầm tay DJI Osmo Pocket 3, gimbal 3 trục, cảm biến 1 inch, quay 4K60.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [
			{ sku: "DJI-OSMO-POCKE-STD-EN", price: 12990000, stockQuantity: 22, variationDetails: { "Màu sắc": "Đen" } },
		],
	},
	{
		name: "Logitech C920 HD Pro",
		description: "Webcam Logitech C920 HD Pro, quay Full HD 1080p, mic stereo tích hợp, tự động lấy nét.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [{ sku: "LOGITECH-C920--STD-EN", price: 1590000, stockQuantity: 15, variationDetails: { "Màu sắc": "Đen" } }],
	},
	{
		name: "TP-Link Tapo C210",
		description: "Camera an ninh TP-Link Tapo C210, độ phân giải 3MP, xoay đứng ngang, phát hiện người AI.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [
			{ sku: "TP-LINK-TAPO-C-STD-TRA", price: 690000, stockQuantity: 22, variationDetails: { "Màu sắc": "Trắng" } },
		],
	},
	{
		name: "DJI Mini 4 Pro",
		description: "Flycam DJI Mini 4 Pro, quay 4K HDR, cảm biến tránh vật cản toàn hướng, nặng dưới 249g.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [
			{ sku: "DJI-MINI-4-PRO-STD-XAM", price: 21990000, stockQuantity: 19, variationDetails: { "Màu sắc": "Xám" } },
		],
	},
	{
		name: "Ring Video Doorbell",
		description: "Chuông cửa thông minh Ring Video Doorbell, camera HD, phát hiện chuyển động, đàm thoại 2 chiều.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [{ sku: "RING-VIDEO-DOO-STD-EN", price: 2490000, stockQuantity: 24, variationDetails: { "Màu sắc": "Đen" } }],
	},
];
/**
 * Seed dữ liệu sản phẩm công nghệ mẫu cho môi trường phát triển/demo.
 * Danh mục (nhiều tầng) được seed riêng trong category.seed.ts và chạy trước productSeed trong server.ts;
 * ở đây chỉ cần tra cứu categoryId theo tên danh mục (tầng lá) để gán vào từng sản phẩm.
 * Chỉ chạy khi bảng products hoàn toàn trống, để không ghi đè dữ liệu thật khi deploy lên môi trường có sẵn sản phẩm.
 */
export const productSeed = async () => {
	const existingProducts = await prisma.product.count();
	if (existingProducts > 0) return;

	// Đảm bảo cây danh mục đã tồn tại (idempotent) trước khi tra cứu, phòng trường hợp productSeed
	// được gọi độc lập (vd trong script/test) mà chưa chạy qua categorySeed() ở server.ts.
	const categoryIdByName = await categorySeed();

	for (const product of seedProducts) {
		const productSlug = slugify(product.name);
		const created = await prisma.product.create({
			data: {
				name: product.name,
				slug: productSlug,
				description: product.description,
				categoryId: categoryIdByName.get(product.categoryName) ?? null,
				isActive: product.isActive ?? true,
				skus: {
					create: product.skus.map((s) => ({
						sku: s.sku,
						price: s.price,
						stockQuantity: s.stockQuantity,
						variationDetails: s.variationDetails as Prisma.InputJsonValue,
					})),
				},
			},
			include: { skus: { orderBy: { id: "asc" } } },
		});

		// Ảnh minh họa (placeholder) để demo tính năng product_images: mỗi SKU 1 ảnh đại diện riêng,
		// hiển thị đúng tên sản phẩm + biến thể (màu/dung lượng) ngay trên ảnh, thay vì ảnh ngẫu nhiên không liên quan.
		for (const sku of created.skus) {
			const seedSku = product.skus.find((s) => s.sku === sku.sku);
			const variantLabel = seedSku ? Object.values(seedSku.variationDetails).join(" - ") : "";
			const imageText = variantLabel ? `${product.name} (${variantLabel})` : product.name;

			await prisma.productImage.create({
				data: {
					productSkuId: sku.id,
					imageUrl: buildPlaceholderImageUrl(imageText),
					altText: `${product.name} - ${sku.sku}`,
					isPrimary: true,
					sortOrder: 0,
				},
			});
		}

		// Đồng bộ thumbnailUrl của Product = ảnh hiển thị tên sản phẩm (giống logic syncProductThumbnail trong product.service.ts)
		const firstSkuWithImage = created.skus[0];
		if (firstSkuWithImage) {
			await prisma.product.update({
				where: { id: created.id },
				data: { thumbnailUrl: buildPlaceholderImageUrl(product.name) },
			});
		}
	}

	console.log("Seeding: 100 sample tech products & categories created successfully");
};
