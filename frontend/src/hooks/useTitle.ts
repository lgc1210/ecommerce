import { useEffect } from "react";
import { useMatches } from "react-router-dom";

type RouteHandle = {
	title?: string;
};

const useTitle = () => {
	const matches = useMatches();

	useEffect(() => {
		const currentMatch = [...matches].reverse().find((m) => (m.handle as RouteHandle | undefined)?.title);
		const title = (currentMatch?.handle as RouteHandle | undefined)?.title;
		if (title) document.title = `${title}`;
	}, [matches]);
};

export default useTitle;
