import { useEffect, useState } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../../features/admin/header/components";
import Sidebar from "../../features/admin/sidebar/components";
import useTitle from "../../hooks/useTitle";

const SIDEBAR_COLLAPSED_KEY = "admin_sidebar_collapsed";

const AdminLayout = () => {
	useTitle();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(() => {
		try {
			return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
		} catch {
			return false;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
		} catch {
			// ignore storage errors (e.g. private browsing)
		}
	}, [collapsed]);

	return (
		<div className='flex min-h-screen bg-cream'>
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				collapsed={collapsed}
				onToggleCollapse={() => setCollapsed((v) => !v)}
			/>

			<div className='flex min-w-0 flex-1 flex-col'>
				<Header onMenuClick={() => setSidebarOpen(true)} />

				<main className='flex-1 p-4 sm:p-6'>
					<Outlet />
					<ScrollRestoration />
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
