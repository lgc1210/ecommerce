import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import authService from "../services";
import { getApiErrorMessage } from "../../../utils/api";
import { useCartStore } from "../../client/cart/stores";
import { CART_QUERY_KEY } from "../../client/cart/constants";
import type {
	FacebookLoginPayload,
	ForgotPasswordPayload,
	GoogleLoginPayload,
	LoginPayload,
	RegisterPayload,
	ResendOtpPayload,
	ResetPasswordPayload,
	VerifyOtpPayload,
} from "../types";

export interface AuthUser {
	id: number;
	name: string;
	email: string;
	phone: string;
	roleId: number;
	provider: string;
	isActive: boolean;
	isVerified: boolean;
	/** Role đầy đủ (id + tên), khác `roleId` vốn chỉ là khoá ngoại thô. */
	role: { id: number; name: string };
	/** Danh sách permission dạng "resource:name" (vd. "catalog:write"), lấy từ role hiện tại. */
	permissions: string[];
}

/**
 * Query key dùng chung cho thông tin user hiện tại.
 * Được export ra ngoài để loader (chạy ngoài React tree) và các hook khác
 * (useLogin, useLogout, ...) có thể đọc/ghi cùng một entry trong cache.
 */
export const AUTH_ME_QUERY_KEY = ["auth", "me"] as const;

/**
 * Gắn giỏ hàng cục bộ (localStorage, khách chưa đăng nhập) hiện có vào payload đăng nhập, để
 * backend đồng bộ vào DB ngay trong request login/google/facebook — xem
 * AuthService.login/loginWithGoogle/loginWithFacebook. Việc này chỉ xảy ra đúng 1 lần tại thời
 * điểm đăng nhập, không có API /cart/merge riêng.
 */
function withLocalCartItems<T extends object>(
	payload: T,
): T & { cartItems: { productSkuId: number; quantity: number }[] } {
	const cartItems = useCartStore
		.getState()
		.items.map((item) => ({ productSkuId: item.productSkuId, quantity: item.quantity }));
	return { ...payload, cartItems };
}

/**
 * Sau khi đăng nhập thành công: backend đã merge giỏ hàng cục bộ vào DB và trả kèm giỏ hàng mới
 * nhất (`cart`) + danh sách sản phẩm không đồng bộ được (`skippedItems`, do hết hàng/ngừng kinh
 * doanh). Ghi thẳng vào cache thay vì gọi lại GET /cart, và xóa giỏ hàng cục bộ vì từ giờ giỏ
 * hàng đã sống trong DB.
 */
function applyLoginCartResult(
	queryClient: QueryClient,
	res: {
		data: { cart?: { items?: { productSkuId: number }[] }; skippedItems?: { productSkuId: number; reason: string }[] };
	},
) {
	if (res.data.cart) {
		queryClient.setQueryData(CART_QUERY_KEY, res.data.cart);
	}

	// CHỈ xoá khỏi giỏ hàng cục bộ đúng những productSkuId đã thực sự có trong giỏ hàng SERVER
	// vừa trả về — KHÔNG unconditionally clear() toàn bộ store. Nếu vì lý do gì đó (lỗi mạng lúc
	// gửi, mismatch dữ liệu cũ, sản phẩm hết hàng...) mà 1 phần (hoặc toàn bộ) giỏ hàng cục bộ
	// chưa thực sự được đồng bộ vào DB, phần đó vẫn được GIỮ LẠI ở local thay vì mất trắng.
	const mergedSkuIds = new Set((res.data.cart?.items ?? []).map((item) => item.productSkuId));
	const stillPendingLocally = useCartStore.getState().items.filter((item) => !mergedSkuIds.has(item.productSkuId));
	if (stillPendingLocally.length !== useCartStore.getState().items.length) {
		useCartStore.setState({ items: stillPendingLocally });
	}

	const skippedCount = res.data.skippedItems?.length ?? 0;
	if (skippedCount > 0) {
		toast.info(`${skippedCount} sản phẩm trong giỏ hàng tạm không thể đồng bộ do đã hết hàng hoặc ngừng kinh doanh.`);
	}
}

/**
 * Gọi GET /auth/me để lấy thông tin user hiện tại dựa vào access token
 * (cookie httpOnly, tự động gửi kèm nhờ withCredentials: true).
 * Nếu chưa đăng nhập (401) thì trả về null thay vì throw, để các trang công khai
 * (home, shop, ...) không bị coi là "lỗi" khi user chưa đăng nhập.
 */
export async function fetchCurrentUser(): Promise<AuthUser | null> {
	try {
		const res = await authService.me();
		return res.data.data as AuthUser;
	} catch {
		return null;
	}
}

export const useMeQuery = () => {
	return useQuery<AuthUser | null>({
		queryKey: AUTH_ME_QUERY_KEY,
		queryFn: fetchCurrentUser,
		staleTime: 5 * 60 * 1000,
	});
};

/**
 * Hook tiện lợi để đọc trạng thái đăng nhập hiện tại trong bất kỳ component nào,
 * ví dụ: header hiển thị avatar/tên user, ẩn hiện menu theo trạng thái đăng nhập, ...
 */
export const useAuth = () => {
	const { data: user, isLoading, isFetching } = useMeQuery();

	return {
		user: user ?? null,
		isAuthenticated: Boolean(user),
		isLoading,
		isFetching,
		/**
		 * Kiểm tra user hiện tại có permission "resource:name" hay không (vd. "catalog:write").
		 * Cùng logic với hasPermission() trong middlewares/rbac.ts, nhưng viết lại tại chỗ
		 * (thay vì import) để tránh circular import: rbac.ts -> features/auth/loader ->
		 * useAuth.ts, nếu useAuth.ts import ngược lại rbac.ts sẽ tạo thành vòng lặp.
		 */
		can: (permissionKey: string) => Boolean(user?.permissions.includes(permissionKey)),
		/** True nếu user có ít nhất 1 trong các permission truyền vào. */
		canAny: (permissionKeys: string[]) => Boolean(user && permissionKeys.some((key) => user.permissions.includes(key))),
	};
};

export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: LoginPayload) => authService.login(withLocalCartItems(payload)),
		onSuccess: (res) => {
			// Đăng nhập trả về sẵn user trong response -> ghi thẳng vào cache thay vì
			// phải gọi lại /auth/me ngay sau đó.
			queryClient.setQueryData(AUTH_ME_QUERY_KEY, res.data.data);
			applyLoginCartResult(queryClient, res);
			toast.success(res.data.message ?? "Đăng nhập thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Đăng nhập thất bại."));
		},
	});
};

/**
 * Đăng nhập bằng Google, nhận idToken (credential JWT) từ Google Identity Services
 * ở phía component (xem layouts/auth) rồi gửi lên backend để xác minh và đổi lấy
 * accessToken/refreshToken (cookie httpOnly), giống hệt luồng useLogin ở trên.
 */
export const useGoogleAuthLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: GoogleLoginPayload) => authService.loginWithGoogle(withLocalCartItems(payload)),
		onSuccess: (res) => {
			queryClient.setQueryData(AUTH_ME_QUERY_KEY, res.data.data);
			applyLoginCartResult(queryClient, res);
			toast.success(res.data.message ?? "Đăng nhập thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Đăng nhập thất bại."));
		},
	});
};

/**
 * Đăng nhập bằng Facebook, nhận accessToken từ Facebook JavaScript SDK (FB.login) ở
 * phía component (xem layouts/auth) rồi gửi lên backend để xác minh và đổi lấy
 * accessToken/refreshToken (cookie httpOnly) nội bộ, giống hệt luồng useGoogleAuthLogin ở trên.
 */
export const useFacebookAuthLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: FacebookLoginPayload) => authService.loginWithFacebook(withLocalCartItems(payload)),
		onSuccess: (res) => {
			queryClient.setQueryData(AUTH_ME_QUERY_KEY, res.data.data);
			applyLoginCartResult(queryClient, res);
			toast.success(res.data.message ?? "Đăng nhập thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Đăng nhập thất bại."));
		},
	});
};

export const useRegister = () => {
	return useMutation({
		mutationFn: (payload: RegisterPayload) => authService.register(payload),
		onSuccess: (res) => {
			toast.success(
				res.data.message ?? "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP xác thực tài khoản.",
			);
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Đăng ký thất bại."));
		},
	});
};

export const useVerifyOtp = () => {
	return useMutation({
		mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload),
		onSuccess: (res) => {
			toast.success(res.data.message ?? "Xác thực tài khoản thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Mã OTP không hợp lệ."));
		},
	});
};

export const useResendOtp = () => {
	return useMutation({
		mutationFn: (payload: ResendOtpPayload) => authService.resendOtp(payload),
		onSuccess: (res) => {
			toast.success(res.data.message ?? "Đã gửi lại mã OTP.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Gửi lại mã OTP thất bại."));
		},
	});
};

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: (payload: ForgotPasswordPayload) => authService.forgotPassword(payload),
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Gửi yêu cầu thất bại."));
		},
	});
};

export const useResetPassword = () => {
	return useMutation({
		mutationFn: (payload: ResetPasswordPayload) => authService.resetPassword(payload),
		onSuccess: (res) => {
			toast.success(res.data.message ?? "Đặt lại mật khẩu thành công.");
		},
		onError: (error) => {
			toast.error(getApiErrorMessage(error, "Đặt lại mật khẩu thất bại."));
		},
	});
};

export const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: () => authService.logout(),
		onSettled: () => {
			// Dù API logout lỗi (vd. mất mạng) hay thành công, phía client vẫn phải
			// xoá sạch session hiện có để tránh hiển thị nhầm trạng thái "đã đăng nhập".
			queryClient.setQueryData(AUTH_ME_QUERY_KEY, null);
			toast.success("Đăng xuất thành công.");
		},
		onError: () => {
			toast.error("Đăng xuất trên server thất bại, nhưng phiên đăng nhập cục bộ đã được xoá.");
		},
	});
};
