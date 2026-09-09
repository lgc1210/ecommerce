import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../../features/client/header/components";
import Footer from "../../features/client/footer/components";
import { useResetScroll } from "../../hooks/useResetScroll";
import ChatWidget from "../../features/client/conversation/components/chat-widget";
import { useLocation, useMatches } from "react-router-dom";
import SeoHead from "../../components/seo-head";
import type { RouteHandle } from "../../types";

const ClientLayout = () => {
	const { getScrollKey } = useResetScroll();
	const location = useLocation();
	const matches = useMatches();
	const currentHandle = [...matches].reverse().find((match) => (match.handle as RouteHandle | undefined)?.title)?.handle as RouteHandle | undefined;

	return (
		<div className='flex min-h-screen flex-col bg-cream'>
			<SeoHead
				title={currentHandle?.title}
				description={currentHandle?.description}
				canonicalPath={location.pathname}
				noindex={currentHandle?.seo?.noindex}
			/>
			<Header />
			<main className='flex-1'>
				<Outlet />
			</main>
			<Footer />
			<ChatWidget />
			<ScrollRestoration getKey={getScrollKey} />
		</div>
	);
};

export default ClientLayout;
