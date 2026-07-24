import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../../features/client/header/components";
import Footer from "../../features/client/footer/components";
import useTitle from "../../hooks/useTitle";

const ClientLayout = () => {
	useTitle();

	return (
		<div className='flex min-h-screen flex-col bg-cream'>
			<Header />
			<main className='flex-1'>
				<Outlet />
				<ScrollRestoration />
			</main>
			<Footer />
		</div>
	);
};

export default ClientLayout;
