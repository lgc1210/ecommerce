import { HeadsetIcon, ShieldCheckIcon, TruckIcon } from "../../../../../components/icons";
import type { HomeValueItem } from "../../types";

/** Map "icon_name" cấu hình ở Strapi (field value_item.icon_name) sang icon component tương ứng ở frontend. */
const VALUE_ICON_MAP: Record<string, typeof TruckIcon> = {
	Truck: TruckIcon,
	Shield: ShieldCheckIcon,
	Headset: HeadsetIcon,
};

interface TrustBadgesSectionProps {
	valueItems: HomeValueItem[];
}

/** Dải 3 giá trị cốt lõi (giao hàng, bảo hành, hỗ trợ...) ngay dưới hero - nội dung lấy từ Strapi. */
const TrustBadgesSection = ({ valueItems }: TrustBadgesSectionProps) => {
	return (
		<section className='border-b border-border'>
			<div className='mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:grid-cols-3 lg:px-8'>
				{valueItems.map((item) => {
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
	);
};

export default TrustBadgesSection;
