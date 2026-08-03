import { useState } from "react";
import { useLocation } from "react-router-dom";
import BreadCrumb from "../../components/breadcrumb";
import { Tabs, TabItem } from "../../components/tabs";
import { BoxIcon, MailIcon, MapPinIcon, UserIcon } from "../../components/icons";

import ProfileTab from "../../features/client/me/components/account/profile-tab";
import AddressesTab from "../../features/client/me/components/account/addresses-tab";
import MyContactsTab from "../../features/client/me/components/account/my-contacts-tab";
import OrdersTab from "../../features/client/order/components/order-tab";

const TABS = Object.freeze({
	profile: "profile",
	addresses: "addresses",
	orders: "orders",
	contacts: "contacts",
} as const);

type Tab = (typeof TABS)[keyof typeof TABS];

/**
 * Trang "Tài khoản của tôi": 4 tab tương ứng đúng các nhóm route self-service ở
 * backend:
 * - "profile": PATCH /users/me (đổi tên/SĐT)
 * - "addresses": GET/POST/PATCH/DELETE /users/me/addresses (sổ địa chỉ)
 * - "orders": GET /orders/me, GET /orders/me/:id (đơn hàng + chi tiết + tracking)
 * - "contacts": GET /contacts/me (lịch sử liên hệ đã gửi, chỉ đọc)
 *
 * Route "/account" được bảo vệ bởi requireAuthLoader (chỉ cần đăng nhập, không
 * yêu cầu permission đặc biệt — riêng tab "orders" cần thêm permission
 * "order:read", backend đã cấp sẵn cho role "customer" nên không cần thêm
 * loader riêng ở route này).
 *
 * Tab khởi tạo có thể được chỉ định qua `location.state.tab` (vd. sau khi đặt hàng thành công ở
 * trang /payment, điều hướng thẳng sang đây kèm state để mở sẵn tab "Đơn hàng").
 */
const AccountPage = () => {
	const location = useLocation();
	const initialTab = (location.state as { tab?: Tab } | null)?.tab ?? TABS.profile;
	const [tab, setTab] = useState<Tab>(initialTab);

	return (
		<div>
			<BreadCrumb title='Tài khoản của tôi' description='Quản lý thông tin cá nhân và sổ địa chỉ giao hàng.' />
			<div className='mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8'>
				<Tabs value={tab} onChange={setTab} className='mb-6'>
					<TabItem value={TABS.profile} icon={<UserIcon className='h-4 w-4' />}>
						Thông tin tài khoản
					</TabItem>
					<TabItem value={TABS.addresses} icon={<MapPinIcon className='h-4 w-4' />}>
						Sổ địa chỉ
					</TabItem>
					<TabItem value={TABS.orders} icon={<BoxIcon className='h-4 w-4' />}>
						Đơn hàng
					</TabItem>
					<TabItem value={TABS.contacts} icon={<MailIcon className='h-4 w-4' />}>
						Liên hệ của tôi
					</TabItem>
				</Tabs>
				{tab === TABS.profile ? (
					<ProfileTab />
				) : tab === TABS.addresses ? (
					<AddressesTab />
				) : tab === TABS.orders ? (
					<OrdersTab />
				) : (
					<MyContactsTab />
				)}
			</div>
		</div>
	);
};

export default AccountPage;
