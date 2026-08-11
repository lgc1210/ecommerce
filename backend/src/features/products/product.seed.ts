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
const buildPlaceholderImageUrl = (text: string): string => `https://placehold.co/800x800/EDE7DD/3A3226?font=roboto&text=${encodeURIComponent(text)}`;

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
		name: "Keychron K8 Pro",
		description: "Bàn phím cơ Keychron K8 Pro, kết nối không dây/bluetooth, hotswap switch, layout 87 phím.",
		categoryName: "Bàn Phím Cơ",
		skus: [{ sku: "KEYCHRON-K8-PR-STD-EN", price: 2490000, stockQuantity: 20, variationDetails: { "Màu sắc": "Đen" } }],
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
		name: "Samsung SSD 990 Pro",
		description: "Ổ cứng SSD Samsung 990 Pro NVMe M.2 PCIe 4.0, tốc độ đọc lên tới 7450MB/s.",
		categoryName: "Ổ Cứng & Lưu Trữ",
		skus: [
			{ sku: "SAMSUNG-SSD-99-1TB-STD", price: 2790000, stockQuantity: 24, variationDetails: { "Phiên bản": "1TB" } },
			{ sku: "SAMSUNG-SSD-99-2TB-STD", price: 2790000, stockQuantity: 31, variationDetails: { "Phiên bản": "2TB" } },
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
		name: "Xiaomi Camera Home 2K",
		description: "Camera an ninh Xiaomi Home 2K, xoay 360 độ, đàm thoại 2 chiều, phát hiện chuyển động AI.",
		categoryName: "Camera & Thiết Bị An Ninh",
		skus: [{ sku: "XIAOMI-CAMERA--STD-TRA", price: 690000, stockQuantity: 16, variationDetails: { "Màu sắc": "Trắng" } }],
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

	console.log("Seeding: 12 sample tech products & categories created successfully");
};
