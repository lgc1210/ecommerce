import { QueryClient } from "@tanstack/react-query";

/**
 * Instance QueryClient dùng chung cho toàn bộ app.
 *
 * Quan trọng: instance này phải được export và tái sử dụng ở cả hai nơi:
 * - `main.tsx` (bọc <QueryClientProvider> quanh cây component React)
 * - Các route loader trong `configs/routes` (vd. requireAuthLoader, guestOnlyLoader)
 *
 * Sở dĩ cần dùng chung vì loader của React Router chạy TRƯỚC khi component
 * được render, tức là nằm ngoài React context. Loader không thể gọi hook
 * `useQueryClient()`, nên phải import trực tiếp instance này để gọi
 * `queryClient.fetchQuery(...)`. Nhờ dùng chung instance, cache "auth-me"
 * được điền bởi loader sẽ được các component (qua useQuery) đọc lại ngay
 * lập tức mà không cần gọi lại API.
 */
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
			staleTime: 60 * 1000,
		},
	},
});

export default queryClient;
