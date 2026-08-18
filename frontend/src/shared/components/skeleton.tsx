import type { CSSProperties } from "react";

interface SkeletonProps {
	className?: string;
	style?: CSSProperties;
}

/** Khối skeleton nguyên tử dùng chung toàn app — nền cream-soft nhấp nháy (animate-pulse). */
export const Skeleton = ({ className = "", style }: SkeletonProps) => <div className={`animate-pulse rounded-md bg-cream-soft ${className}`} style={style} />;

/** Nhiều dòng text skeleton, dòng cuối ngắn hơn để trông tự nhiên hơn. */
export const SkeletonText = ({ lines = 2, className = "" }: { lines?: number; className?: string }) => (
	<div className={`space-y-2 ${className}`}>
		{Array.from({ length: lines }).map((_, i) => (
			<Skeleton key={i} className={`h-3.5 ${i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`} />
		))}
	</div>
);

/**
 * Các hàng <tr> skeleton dùng cho bảng admin (thead giữ nguyên, chỉ thay tbody khi isLoading).
 * columns phải khớp số cột thật của bảng để không bị lệch layout. withThumbnail: cột đầu có
 * avatar vuông + 2 dòng text (dùng cho bảng sản phẩm, danh mục... có ảnh đại diện).
 */
export const SkeletonTableRows = ({
	rows = 5,
	columns,
	withThumbnail = false,
	thumbnailShape = "square",
}: {
	rows?: number;
	columns: number;
	withThumbnail?: boolean;
	thumbnailShape?: "square" | "circle";
}) => (
	<>
		{Array.from({ length: rows }).map((_, r) => (
			<tr key={r} className='border-b border-border last:border-0'>
				{Array.from({ length: columns }).map((_, c) => (
					<td key={c} className='px-5 py-3.5'>
						{c === 0 && withThumbnail ? (
							<div className='flex items-center gap-3'>
								<Skeleton className={`h-10 w-10 shrink-0 ${thumbnailShape === "circle" ? "rounded-full" : "rounded-xl"}`} />
								<div className='min-w-0 flex-1 space-y-1.5'>
									<Skeleton className='h-3.5 w-3/4' />
									<Skeleton className='h-3 w-1/2' />
								</div>
							</div>
						) : (
							<Skeleton className='h-3.5 w-full max-w-32' />
						)}
					</td>
				))}
			</tr>
		))}
	</>
);

/** Thẻ sản phẩm skeleton — ảnh vuông + tên + giá, dùng cho grid/carousel sản phẩm (home, shop). */
export const SkeletonProductCard = ({ className = "" }: { className?: string }) => (
	<div className={`flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 ${className}`}>
		<Skeleton className='aspect-square w-full rounded-xl' />
		<Skeleton className='h-4 w-4/5' />
		<Skeleton className='h-4 w-1/3' />
	</div>
);

/** Lưới nhiều SkeletonProductCard — truyền className để set số cột grid khớp với UI thật. */
export const SkeletonProductGrid = ({ count = 8, className = "" }: { count?: number; className?: string }) => (
	<div className={className}>
		{Array.from({ length: count }).map((_, i) => (
			<SkeletonProductCard key={i} />
		))}
	</div>
);

/** Vòng tròn/hình vuông đại diện + vài dòng text — dùng cho từng dòng danh sách (thông báo, địa chỉ, liên hệ...). */
export const SkeletonListItem = ({ withAvatar = true, avatarShape = "circle" }: { withAvatar?: boolean; avatarShape?: "circle" | "square" }) => (
	<div className='flex items-start gap-3 border-b border-border py-3.5 last:border-0'>
		{withAvatar && <Skeleton className={`h-10 w-10 shrink-0 ${avatarShape === "circle" ? "rounded-full" : "rounded-xl"}`} />}
		<div className='min-w-0 flex-1 space-y-2'>
			<Skeleton className='h-3.5 w-2/3' />
			<Skeleton className='h-3 w-full' />
		</div>
	</div>
);

/** Danh sách nhiều SkeletonListItem. */
export const SkeletonList = ({
	count = 4,
	withAvatar = true,
	avatarShape = "circle",
	className = "",
}: {
	count?: number;
	withAvatar?: boolean;
	avatarShape?: "circle" | "square";
	className?: string;
}) => (
	<div className={className}>
		{Array.from({ length: count }).map((_, i) => (
			<SkeletonListItem key={i} withAvatar={withAvatar} avatarShape={avatarShape} />
		))}
	</div>
);

/** Khối card skeleton chung chung (bo góc, viền, nền surface) — bọc SkeletonText hoặc nội dung tuỳ biến bên trong. */
export const SkeletonCard = ({ className = "", children }: { className?: string; children?: React.ReactNode }) => (
	<div className={`rounded-2xl border border-border bg-surface p-5 ${className}`}>{children ?? <SkeletonText lines={3} />}</div>
);

/**
 * Danh sách các "card" hàng ngang (không phải bảng) — dùng cho danh sách đơn hàng, liên hệ...
 * nơi mỗi mục là 1 khối bo góc riêng thay vì hàng trong bảng.
 */
export const SkeletonCardRows = ({ rows = 4, className = "" }: { rows?: number; className?: string }) => (
	<div className={`space-y-3 ${className}`}>
		{Array.from({ length: rows }).map((_, i) => (
			<div key={i} className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-5'>
				<div className='space-y-2'>
					<Skeleton className='h-4 w-32' />
					<Skeleton className='h-3 w-44' />
				</div>
				<div className='flex items-center gap-4'>
					<Skeleton className='h-4 w-20' />
					<Skeleton className='h-6 w-20 rounded-full' />
				</div>
			</div>
		))}
	</div>
);

export default Skeleton;
