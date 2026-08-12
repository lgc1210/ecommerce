// Facebook không có sẵn 1 package React chính thức như "@react-oauth/google", nên ta
// tự load Facebook JavaScript SDK (script connect.facebook.net) rồi gọi FB.login()
// để lấy accessToken NGAY tại client, KHÔNG điều hướng sang trang Facebook rồi redirect
// về (đó là authorization-code/OAuth redirect flow, không dùng ở đây) — giống hệt cách
// useGoogleLogin lấy accessToken trong layouts/auth/index.tsx.

declare global {
	interface Window {
		FB?: {
			init: (params: { appId: string; cookie?: boolean; xfbml?: boolean; version: string }) => void;
			login: (callback: (response: { authResponse: { accessToken: string; userID: string } | null; status: string }) => void, options?: { scope?: string }) => void;
		};
		fbAsyncInit?: () => void;
	}
}

// Cache lại promise load SDK ở module scope (không phải trong component) để dù hook
// này được dùng ở nhiều nơi (login.tsx, register.tsx) thì script và FB.init() cũng
// chỉ chạy đúng 1 lần cho cả vòng đời trang.
let facebookSdkPromise: Promise<void> | null = null;

function loadFacebookSdk(appId: string): Promise<void> {
	if (typeof window === "undefined") {
		return Promise.reject(new Error("Facebook SDK chỉ chạy được ở trình duyệt."));
	}
	if (window.FB) return Promise.resolve();
	if (facebookSdkPromise) return facebookSdkPromise;

	facebookSdkPromise = new Promise((resolve) => {
		window.fbAsyncInit = () => {
			window.FB!.init({
				appId,
				cookie: true,
				xfbml: false,
				version: import.meta.env.VITE_FACEBOOK_SDK_VERSION,
			});
			resolve();
		};

		if (document.getElementById(import.meta.env.VITE_FACEBOOK_SDK_SCRIPT_ID)) return;

		const script = document.createElement("script");
		script.id = import.meta.env.VITE_FACEBOOK_SDK_SCRIPT_ID;
		script.src = import.meta.env.VITE_FACEBOOK_SDK_SRC;
		script.async = true;
		script.defer = true;
		document.body.appendChild(script);
	});

	return facebookSdkPromise;
}

/**
 * Hook cung cấp hàm đăng nhập Facebook, trả về accessToken (short-lived user access
 * token) ngay tại client để gửi lên backend xác minh, giống hệt luồng accessToken của Google.
 */
export function useFacebookLogin() {
	const appId = import.meta.env.VITE_FACEBOOK_APP_ID as string;

	const login = (): Promise<string> => {
		return loadFacebookSdk(appId).then(
			() =>
				new Promise<string>((resolve, reject) => {
					window.FB!.login(
						(response) => {
							if (response.authResponse?.accessToken) {
								resolve(response.authResponse.accessToken);
							} else {
								reject(new Error("Bạn đã huỷ đăng nhập hoặc chưa cấp quyền cho ứng dụng."));
							}
						},
						{ scope: "email,public_profile" },
					);
				}),
		);
	};

	return { login };
}
