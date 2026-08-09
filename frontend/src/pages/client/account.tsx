import { useState } from "react";
import { BellIcon, BoxIcon, MailIcon, MapPinIcon, UserIcon } from "../../components/icons";
import { TabItem, Tabs } from "../../components/tabs";
import { useLocation } from "react-router-dom";

import BreadCrumb from "../../components/breadcrumb";
import AddressesTab from "../../features/client/me/components/account/addresses-tab";
import MyContactsTab from "../../features/client/me/components/account/my-contacts-tab";
import NotificationsTab from "../../features/client/me/components/account/notifications-tab";
import OrdersTab from "../../features/client/me/components/account/order-tab";
import ProfileTab from "../../features/client/me/components/account/profile-tab";

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

const AccountPage = () => {
	const location = useLocation();

	const initialTab = (location.state as { tab?: Tab } | null)?.tab ?? TABS[0].name;

	const [tab, setTab] = useState<Tab>(initialTab);

	return (
		<div>
			<BreadCrumb title='Tài khoản của tôi' description='Quản lý thông tin cá nhân và sổ địa chỉ giao hàng.' />

			<div className='mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8'>
				<Tabs value={tab} onChange={setTab} className='mb-6'>
					{TABS.map((item) => (
						<TabItem key={item.name} value={item.name} icon={item.icon}>
							{item.label}
						</TabItem>
					))}
				</Tabs>

				{tab === "profile" && <ProfileTab />}
				{tab === "addresses" && <AddressesTab />}
				{tab === "orders" && <OrdersTab />}
				{tab === "contacts" && <MyContactsTab />}
				{tab === "notifications" && <NotificationsTab />}
			</div>
		</div>
	);
};

export default AccountPage;
