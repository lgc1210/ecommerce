import bcrypt from "bcrypt";
import prisma from "../../config/prisma.js";
import { sendEmail } from "../../config/email.js";
import { env } from "../../config/dotenv.js";
import pkg from "../../generated/prisma/index.js";
import { Prisma } from "../../generated/prisma/index.js";
import type { TokenPayload } from "../../middlewares/authenticate.js";
import cartService from "../carts/cart.service.js";
import { generateOtpCode, getOtpExpiryDate, signAccessToken, signRefreshToken, verifyRefreshToken, sanitizeUser, OTP_MAX_ATTEMPTS, REFRESH_TOKEN_MAX_AGE_MS } from "./auth.utils.js";
import type { FacebookLoginInput, ForgotPasswordInput, GoogleLoginInput, LoginInput, RegisterInput, ResendOtpInput, ResetPasswordInput, VerifyOtpInput } from "./auth.validation.js";
import axios from "axios";
import { BCRYPT_SALT_ROUNDS, DEFAULT_CUSTOMER_ROLE_NAME, FACEBOOK_GRAPH_API_BASE, FACEBOOK_GRAPH_API_VERSION, GOOGLE_TOKENINFO_URL, GOOGLE_USERINFO_URL } from "./auth.constant.js";

const { OtpType, OtpStatus, Provider } = pkg;

// Include dùng chung để lấy kèm role + permissions của role đó, phục vụ việc
// trả về "quyền của chính tôi" ở /auth/me (và ngay sau khi login), để frontend
// tự quyết định route guard / ẩn hiện UI mà không cần gọi thêm API rbac:manage
// (API đó vốn chỉ dành cho admin quản lý role/permission của người khác).
const userWithRoleInclude = {
	role: {
		include: {
			permissions: { include: { permission: true } },
		},
	},
} satisfies Prisma.UserInclude;

type UserWithRole = Prisma.UserGetPayload<{ include: typeof userWithRoleInclude }>;

class AuthService {
	// ==========================================
	// Đăng ký tài khoản local (email + password)
	// ==========================================
	async register({ name, email, phone, password }: RegisterInput) {
		const existingUser = await prisma.user.findFirst({
			where: { OR: [{ email: email }, { phone: phone }] },
		});
		if (existingUser) {
			const field = existingUser.email === email ? "Email" : "Số điện thoại";
			throw new Error(`Conflict: ${field} này đã được sử dụng.`);
		}

		const customerRole = await this.getDefaultCustomerRole();
		const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

		const user = await prisma.user.create({
			data: {
				name: name,
				email: email,
				phone: phone,
				passwordHash,
				roleId: customerRole.id,
				provider: Provider.local,
				isActive: true,
				isVerified: false,
			},
		});

		await this.issueOtp(user.id, user.email, OtpType.registration);
		return sanitizeUser(user);
	}

	// ==========================================
	// Xác thực OTP đăng ký -> kích hoạt tài khoản
	// ==========================================
	async verifyRegistrationOtp({ email, otpCode }: VerifyOtpInput) {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			throw new Error("NotFound: Không tìm thấy tài khoản với email này.");
		}
		if (user.isVerified) {
			throw new Error("Conflict: Tài khoản đã được xác thực trước đó.");
		}
		await this.validateAndConsumeOtp(email, otpCode, OtpType.registration);

		const verifiedUser = await prisma.user.update({
			where: { id: user.id },
			data: { isVerified: true },
		});

		return sanitizeUser(verifiedUser);
	}

	// ==========================================
	// Gửi lại OTP (đăng ký hoặc quên mật khẩu)
	// ==========================================
	async resendOtp({ email, type }: ResendOtpInput) {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			throw new Error("NotFound: Không tìm thấy tài khoản với email này.");
		}
		if (type === OtpType.registration && user.isVerified) {
			throw new Error("Conflict: Tài khoản đã được xác thực trước đó.");
		}
		// Vô hiệu hóa các OTP cũ còn hiệu lực cùng loại để tránh chồng chéo mã hợp lệ
		await prisma.otp.updateMany({
			where: { target: email, type: type as any, status: OtpStatus.pending },
			data: { status: OtpStatus.expired },
		});
		await this.issueOtp(user.id, email, type as any);
	}

	// ==========================================
	// Đăng nhập
	// ==========================================
	async login({ email, password, cartItems: pendingCartItems }: LoginInput) {
		const user = await prisma.user.findUnique({ where: { email }, include: userWithRoleInclude });

		// if (!user || user.provider !== Provider.local || !user.passwordHash) {
		// 	throw new Error("Unauthorized: Email hoặc mật khẩu không chính xác.");
		// }
		if (!user || !user.passwordHash) {
			throw new Error("Unauthorized: Email hoặc mật khẩu không chính xác.");
		}
		if (!user.isActive) {
			throw new Error("Forbidden: Tài khoản của bạn đã bị vô hiệu hóa.");
		}
		if (!user.isVerified) {
			throw new Error("Forbidden: Vui lòng xác thực email trước khi đăng nhập.");
		}

		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
		if (!isPasswordValid) {
			throw new Error("Unauthorized: Email hoặc mật khẩu không chính xác.");
		}

		const payload: TokenPayload = { id: user.id, email: user.email, roleId: user.roleId };
		const accessToken = signAccessToken(payload);
		const refreshToken = signRefreshToken(payload);

		await prisma.refreshToken.create({
			data: {
				userId: user.id,
				token: refreshToken,
				expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
			},
		});

		// Đồng bộ giỏ hàng cục bộ (localStorage, gửi kèm ở payload đăng nhập) vào DB — chỉ xảy ra
		// đúng 1 lần tại đây, ngay khi đăng nhập thành công. Không phải endpoint riêng.
		const { cart, skippedItems } = await cartService.mergeLocalCartToDb(user.id, pendingCartItems);

		return { user: this.toAuthUser(user), accessToken, refreshToken, cart, skippedItems };
	}

	// ==========================================
	// Đăng nhập bằng Google (accessToken flow, OAuth 2.0 implicit, không redirect)
	// ==========================================
	// Frontend dùng hook useGoogleLogin() (Google Identity Services, flow mặc định
	// "implicit") để lấy accessToken ngay trên trang login/register, không điều hướng
	// qua Google rồi redirect về. accessToken không tự chứa chữ ký như idToken (JWT)
	// nên phải xác minh bằng cách gọi ngược lên 2 endpoint REST của Google, giống hệt
	// cơ chế xác minh accessToken của Facebook bên dưới (loginWithFacebook).
	// Đặt tên tham số là googleAccessToken (thay vì accessToken trùng tên) vì bên dưới
	// còn 1 accessToken khác — JWT nội bộ hệ thống tự ký cấp cho user (signAccessToken),
	// hoàn toàn khác với accessToken do Google phát hành.
	async loginWithGoogle({ accessToken: googleAccessToken, cartItems: pendingCartItems = [] }: GoogleLoginInput) {
		// Bước 1: Xác minh accessToken hợp lệ bằng endpoint "tokeninfo" của Google.
		// Axios tự động encode query parameters thông qua option `params`.
		const { data: tokenInfo } = await axios
			.get(GOOGLE_TOKENINFO_URL, {
				params: { access_token: googleAccessToken },
			})
			.catch(() => {
				throw new Error("Unauthorized: Không thể xác minh accessToken của Google.");
			});

		if (!tokenInfo || tokenInfo.error || tokenInfo.aud !== env.GOOGLE_CLIENT_ID) {
			throw new Error("Unauthorized: accessToken của Google không hợp lệ hoặc đã hết hạn.");
		}

		// Bước 2: Lấy thông tin hồ sơ (id, tên, email) thông qua Authorization Header.
		const { data: googleProfile } = await axios
			.get(GOOGLE_USERINFO_URL, {
				headers: { Authorization: `Bearer ${googleAccessToken}` },
			})
			.catch(() => {
				throw new Error("Unauthorized: Không thể lấy thông tin tài khoản Google.");
			});

		console.log("GOOGLE PROFILE: ", googleProfile);

		if (!googleProfile || googleProfile.error || !googleProfile.email) {
			throw new Error("Unauthorized: Không thể lấy thông tin tài khoản Google.");
		}

		// userinfo trả về email_verified dạng boolean thật (chuẩn OIDC), không phải chuỗi.
		if (!googleProfile.email_verified) {
			throw new Error("Forbidden: Email Google của bạn chưa được xác thực.");
		}

		const email = (googleProfile.email as string).toLowerCase();
		const googleUserId = googleProfile.sub as string;
		const displayName = `${googleProfile.given_name} ${googleProfile.family_name}`;

		let user = await prisma.user.findUnique({ where: { email }, include: userWithRoleInclude });

		if (user) {
			if (!user.isActive) {
				throw new Error("Forbidden: Tài khoản của bạn đã bị vô hiệu hóa.");
			}

			if (!user.providerId || user.providerId !== googleUserId || !user.isVerified) {
				user = await prisma.user.update({
					where: { id: user.id },
					data: {
						providerId: user.providerId ?? googleUserId,
						isVerified: true,
					},
					include: userWithRoleInclude,
				});
			}
		} else {
			const customerRole = await this.getDefaultCustomerRole();

			user = await prisma.user.create({
				data: {
					name: displayName,
					email,
					phone: null,
					passwordHash: null,
					roleId: customerRole.id,
					provider: Provider.google,
					providerId: googleUserId,
					isActive: true,
					isVerified: true,
				},
				include: userWithRoleInclude,
			});
		}

		const payload: TokenPayload = { id: user.id, email: user.email, roleId: user.roleId };
		const accessToken = signAccessToken(payload);
		const refreshToken = signRefreshToken(payload);

		await prisma.refreshToken.create({
			data: {
				userId: user.id,
				token: refreshToken,
				expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
			},
		});

		const { cart, skippedItems } = await cartService.mergeLocalCartToDb(user.id, pendingCartItems);

		return { user: this.toAuthUser(user), accessToken, refreshToken, cart, skippedItems };
	}

	// ==========================================
	// Đăng nhập bằng Facebook (accessToken flow, không redirect)
	// ==========================================
	// Frontend dùng Facebook JavaScript SDK (FB.login) để lấy accessToken ngay trên
	// trang login/register, không điều hướng qua Facebook rồi redirect về (đó là
	// OAuth redirect flow, không dùng ở đây).
	async loginWithFacebook({ accessToken, cartItems: pendingCartItems = [] }: FacebookLoginInput) {
		// Bước 1: Xác minh accessToken hợp lệ thông qua endpoint debug_token của Facebook Graph API.
		const appAccessToken = `${env.FACEBOOK_APP_ID}|${env.FACEBOOK_APP_SECRET}`;

		const { data: debugResult } = await axios
			.get(`${FACEBOOK_GRAPH_API_BASE}/debug_token`, {
				params: {
					input_token: accessToken,
					access_token: appAccessToken,
				},
			})
			.catch(() => {
				throw new Error("Unauthorized: Không thể xác minh accessToken của Facebook.");
			});

		const tokenData = debugResult?.data;
		if (!tokenData?.is_valid || tokenData.app_id !== env.FACEBOOK_APP_ID) {
			throw new Error("Unauthorized: accessToken của Facebook không hợp lệ hoặc đã hết hạn.");
		}

		// Bước 2: Dùng accessToken để lấy thông tin người dùng (id, name, email).
		const { data: facebookProfile } = await axios
			.get(`${FACEBOOK_GRAPH_API_BASE}/${FACEBOOK_GRAPH_API_VERSION}/me`, {
				params: {
					fields: "id,name,email",
					access_token: accessToken,
				},
			})
			.catch(() => {
				throw new Error("Unauthorized: Không thể lấy thông tin tài khoản Facebook.");
			});

		if (facebookProfile?.error) {
			throw new Error("Unauthorized: accessToken của Facebook không hợp lệ hoặc đã hết hạn.");
		}

		if (!facebookProfile.email) {
			throw new Error("BadRequest: Không lấy được email từ tài khoản Facebook. Vui lòng cấp quyền chia sẻ email khi đăng nhập hoặc sử dụng phương thức đăng nhập khác.");
		}

		const email = (facebookProfile.email as string).toLowerCase();
		const facebookUserId = facebookProfile.id as string;
		const displayName = facebookProfile.name ?? email.split("@")[0] ?? email;

		let user = await prisma.user.findUnique({ where: { email }, include: userWithRoleInclude });

		if (user) {
			if (!user.isActive) {
				throw new Error("Forbidden: Tài khoản của bạn đã bị vô hiệu hóa.");
			}

			if (!user.providerId || user.providerId !== facebookUserId || !user.isVerified) {
				user = await prisma.user.update({
					where: { id: user.id },
					data: {
						providerId: user.providerId ?? facebookUserId,
						isVerified: true,
					},
					include: userWithRoleInclude,
				});
			}
		} else {
			const customerRole = await this.getDefaultCustomerRole();

			user = await prisma.user.create({
				data: {
					name: displayName,
					email,
					phone: null,
					passwordHash: null,
					roleId: customerRole.id,
					provider: Provider.facebook,
					providerId: facebookUserId,
					isActive: true,
					isVerified: true,
				},
				include: userWithRoleInclude,
			});
		}

		const payload: TokenPayload = { id: user.id, email: user.email, roleId: user.roleId };
		const newAccessToken = signAccessToken(payload);
		const newRefreshToken = signRefreshToken(payload);

		await prisma.refreshToken.create({
			data: {
				userId: user.id,
				token: newRefreshToken,
				expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
			},
		});

		const { cart, skippedItems } = await cartService.mergeLocalCartToDb(user.id, pendingCartItems);

		return {
			user: this.toAuthUser(user),
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
			cart,
			skippedItems,
		};
	}

	// ==========================================
	// Cấp lại access token từ refresh token (xoay vòng refresh token)
	// ==========================================
	async refreshAccessToken(rawRefreshToken: string) {
		let payload: TokenPayload;
		try {
			payload = verifyRefreshToken(rawRefreshToken);
		} catch {
			throw new Error("Unauthorized: Refresh token không hợp lệ hoặc đã hết hạn.");
		}

		const storedToken = await prisma.refreshToken.findUnique({ where: { token: rawRefreshToken } });
		if (!storedToken || storedToken.userId !== payload.id) {
			throw new Error("Unauthorized: Refresh token không tồn tại hoặc đã bị thu hồi.");
		}
		if (storedToken.expiresAt && storedToken.expiresAt < new Date()) {
			await prisma.refreshToken.delete({ where: { id: storedToken.id } });
			throw new Error("Unauthorized: Refresh token đã hết hạn, vui lòng đăng nhập lại.");
		}

		// BUG FIX: trước đây access token mới được ký lại từ chính payload cũ giải mã
		// từ refresh token, nên nếu admin đổi role hoặc khóa tài khoản, thay đổi đó
		// không có hiệu lực cho tới khi refresh token hết hạn (tối đa 7 ngày) và user
		// phải đăng nhập lại từ đầu. Ở đây re-fetch user hiện tại từ DB để lấy roleId
		// mới nhất, đồng thời chặn luôn nếu tài khoản đã bị vô hiệu hóa hoặc bị xóa.
		const currentUser = await prisma.user.findUnique({ where: { id: payload.id } });
		if (!currentUser) {
			await prisma.refreshToken.delete({ where: { id: storedToken.id } });
			throw new Error("Unauthorized: Tài khoản không còn tồn tại.");
		}
		if (!currentUser.isActive) {
			await prisma.refreshToken.deleteMany({ where: { userId: currentUser.id } });
			throw new Error("Forbidden: Tài khoản của bạn đã bị vô hiệu hóa.");
		}

		const freshPayload: TokenPayload = { id: currentUser.id, email: currentUser.email, roleId: currentUser.roleId };
		const newAccessToken = signAccessToken(freshPayload);
		const newRefreshToken = signRefreshToken(freshPayload);

		// Xoay vòng (rotate) refresh token: token cũ mất hiệu lực ngay khi có token mới,
		// giảm rủi ro nếu refresh token cũ bị đánh cắp mà không bị phát hiện.
		await prisma.$transaction([
			prisma.refreshToken.delete({ where: { id: storedToken.id } }),
			prisma.refreshToken.create({
				data: {
					userId: currentUser.id,
					token: newRefreshToken,
					expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
				},
			}),
		]);

		return { accessToken: newAccessToken, refreshToken: newRefreshToken };
	}

	// ==========================================
	// Đăng xuất: thu hồi refresh token hiện tại
	// ==========================================
	async logout(rawRefreshToken: string | undefined) {
		if (!rawRefreshToken) return;
		await prisma.refreshToken.deleteMany({ where: { token: rawRefreshToken } });
	}

	// ==========================================
	// Quên mật khẩu: gửi OTP đặt lại mật khẩu
	// ==========================================
	async forgotPassword({ email }: ForgotPasswordInput) {
		const user = await prisma.user.findUnique({ where: { email } });
		// Không throw lỗi "NotFound" ở đây để tránh lộ thông tin email nào đã tồn tại
		// trong hệ thống (user enumeration). Controller luôn trả về message chung chung.
		// if (!user || user.provider !== Provider.local) return;
		if (!user) return;

		await prisma.otp.updateMany({
			where: { target: email, type: OtpType.password_reset, status: OtpStatus.pending },
			data: { status: OtpStatus.expired },
		});

		await this.issueOtp(user.id, email, OtpType.password_reset);
	}

	// ==========================================
	// Đặt lại mật khẩu bằng OTP
	// ==========================================
	async resetPassword({ email, otpCode, newPassword }: ResetPasswordInput) {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			throw new Error("BadRequest: Mã OTP không hợp lệ.");
		}

		await this.validateAndConsumeOtp(email, otpCode, OtpType.password_reset);

		const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

		await prisma.$transaction([
			prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
			// Thu hồi toàn bộ refresh token hiện có -> buộc đăng nhập lại trên mọi thiết bị
			prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
		]);
	}

	// ==========================================
	// Lấy thông tin user hiện tại (dùng cho GET /api/auth/me)
	// ==========================================
	async getMe(userId: number) {
		const user = await prisma.user.findUnique({ where: { id: userId }, include: userWithRoleInclude });
		if (!user) {
			throw new Error("NotFound: Người dùng không tồn tại.");
		}
		return this.toAuthUser(user);
	}

	// ==========================================
	// Private helpers
	// ==========================================

	// Làm phẳng permission ("resource:name") của role gắn với user, để client
	// (frontend) tự kiểm tra quyền mà không cần biết cấu trúc bảng role_permissions.
	private toAuthUser(user: UserWithRole) {
		const { role, ...rest } = user;
		const permissions = role.permissions.map((rolePermission) => `${rolePermission.permission.resource}:${rolePermission.permission.name}`);

		return {
			...sanitizeUser(rest),
			role: { id: role.id, name: role.name },
			permissions,
		};
	}

	private async getDefaultCustomerRole() {
		const customerRole = await prisma.role.findFirst({
			where: { name: DEFAULT_CUSTOMER_ROLE_NAME },
		});

		if (!customerRole) {
			// Đây là lỗi cấu hình hệ thống (thiếu seed data), không phải lỗi do người dùng nhập sai.
			throw new Error(`Config: Role mặc định '${DEFAULT_CUSTOMER_ROLE_NAME}' chưa tồn tại. Vui lòng tạo role này trước (POST /api/rbac/roles).`);
		}

		return customerRole;
	}

	private async issueOtp(userId: number, target: string, type: (typeof OtpType)[keyof typeof OtpType]) {
		const otpCode = generateOtpCode();

		await prisma.otp.create({
			data: {
				userId,
				otpCode,
				target,
				type,
				status: OtpStatus.pending,
				expiresAt: getOtpExpiryDate(),
			},
		});

		await this.sendOtpEmail(target, otpCode, type);
	}

	private async validateAndConsumeOtp(target: string, otpCode: string, type: (typeof OtpType)[keyof typeof OtpType]) {
		const otp = await prisma.otp.findFirst({
			where: { target, type, status: OtpStatus.pending },
			orderBy: { createdAt: "desc" },
		});
		if (!otp) {
			throw new Error("BadRequest: Mã OTP không tồn tại hoặc đã được sử dụng, vui lòng gửi lại mã mới.");
		}
		if (otp.expiresAt < new Date()) {
			await prisma.otp.update({ where: { id: otp.id }, data: { status: OtpStatus.expired } });
			throw new Error("BadRequest: Mã OTP đã hết hạn, vui lòng gửi lại mã mới.");
		}
		if (otp.attempts >= OTP_MAX_ATTEMPTS) {
			await prisma.otp.update({ where: { id: otp.id }, data: { status: OtpStatus.failed_max_attempts } });
			throw new Error("BadRequest: Bạn đã nhập sai mã OTP quá nhiều lần, vui lòng gửi lại mã mới.");
		}
		if (otp.otpCode !== otpCode) {
			await prisma.otp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
			throw new Error("BadRequest: Mã OTP không chính xác.");
		}
		await prisma.otp.update({ where: { id: otp.id }, data: { status: OtpStatus.verified } });
		return otp;
	}

	private async sendOtpEmail(target: string, otpCode: string, type: (typeof OtpType)[keyof typeof OtpType]) {
		const subject = type === OtpType.registration ? "Xác thực tài khoản của bạn" : "Mã OTP đặt lại mật khẩu";

		await sendEmail({
			to: target,
			subject,
			html: `
				<p>Mã OTP của bạn là: <b style="font-size: 20px;">${otpCode}</b></p>
				<p>Mã có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
			`,
		});
	}
}

export default new AuthService();
