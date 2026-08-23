import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BellIcon, BoxIcon, MailIcon, MapPinIcon, StarIcon, UserIcon } from "../../../components/icons";
import { TabItem, Tabs } from "../../../components/tabs";

import BreadCrumb from "../../../components/breadcrumb";
import AddressesTab from "../../../features/client/me/components/account/addresses-tab";
import MyContactsTab from "../../../features/client/me/components/account/my-contacts-tab";
import NotificationsTab from "../../../features/client/me/components/account/notifications-tab";
import OrdersTab from "../../../features/client/me/components/account/order-tab";
import ProfileTab from "../../../features/client/me/components/account/profile-tab";
import ReviewsTab from "../../../features/client/me/components/account/review-tab";

const TABS = [
	{
		name: "profile",
		icon: <UserIcon className='h-4 w-4' />,
		label: "Thông tin tài khoản",
	},
	{
		name: "addresses",
		icon: <MapPinIcon className='h-4 w-4' />,
		label: "Sổ địa chỉ",
	},
	{
		name: "orders",
		icon: <BoxIcon className='h-4 w-4' />,
		label: "Đơn hàng",
	},
	{
		name: "reviews",
		icon: <StarIcon className='h-4 w-4' />,
		label: "Đánh giá của tôi",
	},
	{
		name: "contacts",
		icon: <MailIcon className='h-4 w-4' />,
		label: "Lịch sử liên hệ",
	},
	{
		name: "notifications",
		icon: <BellIcon className='h-4 w-4' />,
		label: "Quản lý thông báo",
	},
] as const;

type Tab = (typeof TABS)[number]["name"];

interface AccountPageLocationState {
	tab?: Tab;
	/** Đơn hàng cần mở sẵn chi tiết khi vào tab "orders" (vd từ link "Xem chi tiết" của 1 thông báo). */
	orderId?: number;
}

const AccountPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const state = location.state as AccountPageLocationState | null;

	const [tab, setTab] = useState<Tab>(state?.tab ?? TABS[0].name);
	const [initialOrderId, setInitialOrderId] = useState<number | null>(state?.orderId ?? null);
	const [syncedLocationKey, setSyncedLocationKey] = useState(location.key);

	// AccountPage KHÔNG re-mount khi điều hướng "/account" -> "/account" (cùng route, chỉ đổi
	// state) — vd bấm "Xem chi tiết" ngay từ trong tab "notifications" (đã ở sẵn trang này), hay
	// bấm "Xem tất cả" ở dropdown chuông trong lúc đang ở 1 tab khác. Đồng bộ lại tab/orderId
	// ngay trong lúc render (không dùng useEffect — gọi setState trong effect để "phản chiếu"
	// theo prop/location gây thêm 1 nhịp render thừa; so sánh location.key trực tiếp trong thân
	// component là cách React khuyến nghị cho việc "điều chỉnh state theo prop thay đổi").
	if (location.key !== syncedLocationKey) {
		setSyncedLocationKey(location.key);
		if (state?.tab) {
			setTab(state.tab);
			setInitialOrderId(state.orderId ?? null);
		}
	}

	/**
	 * Khi user TỰ đổi tab bằng tay (bấm vào <Tabs>) -> phải replace luôn history.state, không
	 * chỉ setTab() nội bộ. Nếu không, history.state của trình duyệt vẫn giữ nguyên state của
	 * lượt điều hướng gốc (vd {tab: "orders", orderId: 123} lúc bấm 1 thông báo) — nên nếu sau
	 * đó user tự chuyển sang tab khác rồi F5, trang sẽ đọc lại state CŨ đó và nhảy về đúng tab
	 * "orders" ban đầu, dù trên màn hình đang ở tab khác. `replace: true` để không tạo thêm entry
	 * lịch sử mới cho mỗi lần đổi tab (tránh spam nút back của trình duyệt).
	 */
	const handleTabChange = (nextTab: Tab) => {
		setTab(nextTab);
		setInitialOrderId(null);
		navigate(location.pathname, { replace: true, state: { tab: nextTab } });
	};

	return (
		<div>
			<BreadCrumb title='Tài khoản của tôi' description='Quản lý thông tin cá nhân và sổ địa chỉ giao hàng.' />

			<div className='mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8'>
				<Tabs value={tab} onChange={handleTabChange} className='mb-6 overflow-x-scroll no-scrollbar'>
					{TABS.map((item) => (
						<TabItem key={item.name} value={item.name} icon={item.icon}>
							{item.label}
						</TabItem>
					))}
				</Tabs>

				{tab === "profile" && <ProfileTab />}
				{tab === "addresses" && <AddressesTab />}
				{tab === "orders" && <OrdersTab initialSelectedOrderId={initialOrderId} />}
				{tab === "reviews" && <ReviewsTab />}
				{tab === "contacts" && <MyContactsTab />}
				{tab === "notifications" && <NotificationsTab />}
			</div>
		</div>
	);
};

export default AccountPage;
