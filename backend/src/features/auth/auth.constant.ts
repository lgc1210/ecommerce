export const TOKENS = Object.freeze({
	accessToken: "accessToken",
	refreshToken: "refreshToken",
} as const);

export const BCRYPT_SALT_ROUNDS = 10;

// accessToken (OAuth 2.0 implicit flow, hook useGoogleLogin ở frontend) không tự chứa
// chữ ký như idToken (JWT) nên không thể verify offline bằng public key của Google.
// Việc xác minh phải thực hiện bằng cách gọi ngược lên 2 endpoint REST của Google:
// tokeninfo (kiểm tra token còn hiệu lực + đúng audience) và userinfo (lấy hồ sơ user),
// cùng cách tiếp cận với việc xác minh accessToken của Facebook bên dưới.
export const GOOGLE_TOKENINFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";
export const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

// Facebook không phát hành idToken dạng JWT tự-chứa-chữ-ký như Google, nên việc xác minh
// accessToken phải thực hiện bằng cách gọi ngược lên Graph API của Facebook (xem loginWithFacebook).
export const FACEBOOK_GRAPH_API_BASE = "https://graph.facebook.com";
export const FACEBOOK_GRAPH_API_VERSION = "v21.0";

// Tên role mặc định gán cho user đăng ký công khai qua form đăng ký.
// Role này cần được tạo trước (vd. qua POST /api/rbac/roles) trước khi cho phép đăng ký.
export const DEFAULT_CUSTOMER_ROLE_NAME = "customer";
