import { Link, useMatches } from "react-router-dom";
import { ChevronRightIcon } from "./icons";
import paths from "../configs/constants/paths";

type RouteHandle = {
	/** Nhãn hiển thị của mắt xích breadcrumb ứng với route này. */
	crumb?: () => string;
	/**
	 * Đường dẫn để điều hướng khi bấm vào mắt xích này (vd paths.client.shop). Bỏ trống nếu
	 * route không tương ứng với 1 trang cụ thể có thể điều hướng tới (mắt xích chỉ mang tính
	 * hiển thị) — khi đó mắt xích sẽ render dạng text thường, không phải link.
	 */
	crumbPath?: string;
};

interface BreadCrumbProps {
	title: string;
	description?: string;
}

/** 1 mắt xích breadcrumb: nhãn hiển thị, và đường dẫn để bấm quay lại (nếu có). */
type Crumb = { label: string; path?: string };

const BreadCrumb = ({ title, description }: BreadCrumbProps) => {
	const matches = useMatches();
	// Mắt xích cuối luôn lấy từ `title` (giá trị động của từng trang, vd tên sản phẩm) thay vì
	// crumb tĩnh khai báo ở route hiện tại — tránh lệch giữa tiêu đề trang và breadcrumb khi
	// trang có tiêu đề động (vd trang chi tiết sản phẩm). Các mắt xích trước đó vẫn lấy từ
	// `handle.crumb()` của các route cha (Trang chủ, Cửa hàng...); mắt xích nào có `crumbPath`
	// sẽ render thành link để bấm quay lại được, mắt xích cuối (trang hiện tại) không phải link.
	const crumbs = matches
		.slice(0, -1)
		.reduce<Crumb[]>((acc, match) => {
			const handle = match.handle as RouteHandle | undefined;
			const label = handle?.crumb?.();
			if (label && label !== "Home") acc.push({ label, path: handle?.crumbPath });
			return acc;
		}, [])
		.concat({ label: title });

	return (
		<div className='border-b border-border bg-cream-soft'>
			<div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
				<h1 className='text-3xl font-extrabold tracking-tight text-ink sm:text-4xl'>{title}</h1>
				{description && <p className='mt-2 max-w-xl text-sm text-muted'>{description}</p>}
				<div className='mt-4 flex items-center gap-1.5 text-sm text-muted'>
					<Link to={paths.client.home} className='font-medium hover:text-primary-dark text-nowrap cursor-default!' viewTransition>
						Trang chủ
					</Link>
					{crumbs.map((crumb, index) => {
						const isLast = index === crumbs.length - 1;
						return (
							<span key={`${crumb.label}-${index}`} className='flex items-center gap-1.5 font-medium'>
								<ChevronRightIcon className='h-3.5 w-3.5' />
								{!isLast && crumb.path ? (
									<Link to={crumb.path} className='hover:text-primary-dark text-nowrap cursor-default!' viewTransition>
										{crumb.label}
									</Link>
								) : (
									<span className={`md:w-full sm:w-36 w-24 truncate ${isLast ? "text-ink" : ""}`}>{crumb.label}</span>
								)}
							</span>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default BreadCrumb;
