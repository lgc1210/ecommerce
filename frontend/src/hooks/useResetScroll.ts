import { useMatches, type Location, type UIMatch } from "react-router-dom";
import type { RouteHandle } from "../types";

interface UseResetScrollReturn {
	// Dùng chuẩn kiểu gốc lỏng lẻo của thư viện
	getScrollKey: (currentLocation: Location, allMatches: UIMatch<unknown, unknown>[]) => string;
}

export function useResetScroll(): UseResetScrollReturn {
	const matches = useMatches();

	const shouldPreventReset = matches.some((match) => {
		const handle = match.handle as RouteHandle | undefined;
		return handle?.preventScrollReset === true;
	});

	const getScrollKey = (currentLocation: Location, allMatches: UIMatch<unknown, unknown>[]): string => {
		const currentMatch = allMatches[allMatches.length - 1];

		if (shouldPreventReset) {
			const routeId = currentMatch?.id || "";
			return `${routeId}-${currentLocation.pathname}`;
		}

		return currentLocation.key;
	};

	return { getScrollKey };
}
