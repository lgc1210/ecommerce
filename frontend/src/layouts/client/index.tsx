import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../../features/client/header/components";
import Footer from "../../features/client/footer/components";
import useTitle from "../../hooks/useTitle";
import { useResetScroll } from "../../hooks/useResetScroll";

const ClientLayout = () => {
	useTitle();
	const { getScrollKey } = useResetScroll();

	return (
		<div className='flex min-h-screen flex-col bg-cream'>
			<Header />
			<main className='flex-1'>
				<Outlet />
			</main>
			<Footer />
			<ScrollRestoration getKey={getScrollKey} />
		</div>
	);
};

export default ClientLayout;
