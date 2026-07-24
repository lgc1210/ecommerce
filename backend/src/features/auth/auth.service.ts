import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import prisma from "../../config/prisma.js";
import transporter from "../../config/email.js";
import { env } from "../../config/dotenv.js";
import pkg from "../../generated/prisma/index.js";
import type { Prisma } from "../../generated/prisma/index.js";
import type { TokenPayload } from "../../middlewares/authenticate.js";
import cartService from "../carts/cart.service.js";
import {
	generateOtpCode,
	getOtpExpiryDate,
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
	sanitizeUser,
	OTP_MAX_ATTEMPTS,
	REFRESH_TOKEN_MAX_AGE_MS,
} from "./auth.utils.js";

/** 1 dòng giỏ hàng cục bộ (localStorage) gửi kèm payload đăng nhập, xem auth.validation.ts#cartItemsSchema. */
interface PendingCartItem {
	productSkuId: number;
	quantity: number;
}

const { OtpType, OtpStatus, Provider } = pkg;

const BCRYPT_SALT_ROUNDS = 10;

// Dùng chung 1 OAuth2Client để verify idToken. Không cần client secret vì ta chỉ
// xác minh chữ ký + audience của idToken (public key của Google), không thực hiện
// trao đổi authorization code -> access token (đó là OAuth redirect flow, không dùng ở đây).
const googleOAuthClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// Facebook không phát hành idToken dạng JWT tự-chứa-chữ-ký như Google, nên việc xác minh
// accessToken phải thực hiện bằng cách gọi ngược lên Graph API của Facebook (xem loginWithFacebook).
const FACEBOOK_GRAPH_API_BASE = "https://graph.facebook.com";
const FACEBOOK_GRAPH_API_VERSION = "v21.0";

// Tên role mặc định gán cho user đăng ký công khai qua form đăng ký.
// Role này cần được tạo trước (vd. qua POST /api/rbac/roles) trước khi cho phép đăng ký.
const DEFAULT_CUSTOMER_ROLE_NAME = "customer";

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
	async register(input: { name: string; email: string; phone: string; password: string }) {
		const existingUser = await prisma.user.findFirst({
			where: { OR: [{ email: input.email }, { phone: input.phone }] },
		});

		if (existingUser) {
			const field = existingUser.email === input.email ? "Email" : "Số điện thoại";
			throw new Error(`Conflict: ${field} này đã được sử dụng.`);
		}

		const customerRole = await this.getDefaultCustomerRole();

		const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

		const user = await prisma.user.create({
			data: {
				name: input.name,
				email: input.email,
				phone: input.phone,
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
	async verifyRegistrationOtp(email: string, otpCode: string) {
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
	async resendOtp(email: string, type: "registration" | "password_reset") {
		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) {
			throw new Error("NotFound: Không tìm thấy tài khoản với email này.");
		}
		if (type === "registration" && user.isVerified) {
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
	async login(email: string, password: string, pendingCartItems: PendingCartItem[] = []) {
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
	// Đăng nhập bằng Google (idToken flow, không redirect)
	// ==========================================
	// Frontend dùng Google Identity Services (GIS) để lấy idToken (credential JWT)
	// ngay trên trang login/register, không điều hướng qua Google rồi redirect về.
	// Ở đây ta xác minh idToken đó bằng chính thư viện chính thức của Google
	// (verify chữ ký RS256 bằng public key của Google + kiểm tra audience/issuer),
	// KHÔNG tự ý decode JWT bằng tay vì như vậy sẽ không xác thực được ai là người
	// thực sự phát hành token.
	async loginWithGoogle(idToken: string, pendingCartItems: PendingCartItem[] = []) {
		console.log("PENDING CART ITEMS: ", pendingCartItems);
		const ticket = await googleOAuthClient
			.verifyIdToken({
				idToken,
				audience: env.GOOGLE_CLIENT_ID,
			})
			.catch(() => {
				throw new Error("Unauthorized: idToken của Google không hợp lệ hoặc đã hết hạn.");
			});

		const googlePayload = ticket.getPayload();
		if (!googlePayload || !googlePayload.email) {
			throw new Error("Unauthorized: Không thể lấy thông tin tài khoản Google.");
		}
		if (!googlePayload.email_verified) {
			throw new Error("Forbidden: Email Google của bạn chưa được xác thực.");
		}

		const email = googlePayload.email.toLowerCase();
		const googleUserId = googlePayload.sub;
		const displayName = googlePayload.name ?? email.split("@")[0] ?? email;

		let user = await prisma.user.findUnique({ where: { email }, include: userWithRoleInclude });

		if (user) {
			if (!user.isActive) {
				throw new Error("Forbidden: Tài khoản của bạn đã bị vô hiệu hóa.");
			}

			// Tài khoản đã tồn tại (vd. đăng ký trước đó bằng email/password) và giờ
			// đăng nhập bằng Google lần đầu -> liên kết thêm providerId, đồng thời coi
			// như email đã được xác thực (Google đã xác thực hộ), KHÔNG đổi mật khẩu
			// hay xoá provider "local" hiện có để user vẫn có thể đăng nhập bằng password.
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
					// Google đã xác thực quyền sở hữu email này -> không cần OTP xác thực lại.
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

		// Đồng bộ giỏ hàng cục bộ (localStorage, gửi kèm ở payload đăng nhập) vào DB — chỉ xảy ra
		// đúng 1 lần tại đây, ngay khi đăng nhập thành công. Không phải endpoint riêng.
		const { cart, skippedItems } = await cartService.mergeLocalCartToDb(user.id, pendingCartItems);

		return { user: this.toAuthUser(user), accessToken, refreshToken, cart, skippedItems };
	}

	// ==========================================
	// Đăng nhập bằng Facebook (accessToken flow, không redirect)
	// ==========================================
	// Frontend dùng Facebook JavaScript SDK (FB.login) để lấy accessToken ngay trên
	// trang login/register, không điều hướng qua Facebook rồi redirect về (đó là
	// OAuth redirect flow, không dùng ở đây).
	async loginWithFacebook(accessToken: string, pendingCartItems: PendingCartItem[] = []) {
		// Bước 1: xác minh accessToken thực sự hợp lệ và thuộc về đúng app này, bằng cách
		// gọi Graph API "debug_token" với App Access Token (APP_ID|APP_SECRET). Đây là bước
		// tương đương việc verifyIdToken() kiểm tra audience ở luồng Google, KHÔNG được bỏ qua
		// vì nếu không, bất kỳ accessToken hợp lệ nào (kể cả cấp cho app Facebook khác) đều
		// có thể được dùng để đăng nhập vào hệ thống của mình.
		const appAccessToken = `${env.FACEBOOK_APP_ID}|${env.FACEBOOK_APP_SECRET}`;
		const debugTokenUrl =
			`${FACEBOOK_GRAPH_API_BASE}/debug_token` +
			`?input_token=${encodeURIComponent(accessToken)}` +
			`&access_token=${encodeURIComponent(appAccessToken)}`;

		const debugResult: any = await fetch(debugTokenUrl)
			.then((res) => res.json())
			.catch(() => {
				throw new Error("Unauthorized: Không thể xác minh accessToken của Facebook.");
			});

		const tokenData = debugResult?.data;
		if (!tokenData?.is_valid || tokenData.app_id !== env.FACEBOOK_APP_ID) {
			throw new Error("Unauthorized: accessToken của Facebook không hợp lệ hoặc đã hết hạn.");
		}

		// Bước 2: dùng chính accessToken của user để lấy thông tin hồ sơ (id, tên, email).
		const profileUrl =
			`${FACEBOOK_GRAPH_API_BASE}/${FACEBOOK_GRAPH_API_VERSION}/me` +
			`?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`;

		const facebookProfile: any = await fetch(profileUrl)
			.then((res) => res.json())
			.catch(() => {
				throw new Error("Unauthorized: Không thể lấy thông tin tài khoản Facebook.");
			});

		if (facebookProfile?.error) {
			throw new Error("Unauthorized: accessToken của Facebook không hợp lệ hoặc đã hết hạn.");
		}

		// Facebook chỉ trả về email nếu user đã cấp quyền "email" lúc đăng nhập. Hệ thống
		// của mình bắt buộc phải có email (unique) nên nếu thiếu, không thể tạo/liên kết
		// tài khoản được -> yêu cầu user cấp lại quyền hoặc dùng phương thức đăng nhập khác.
		if (!facebookProfile.email) {
			throw new Error(
				"BadRequest: Không lấy được email từ tài khoản Facebook. Vui lòng cấp quyền chia sẻ email khi đăng nhập hoặc sử dụng phương thức đăng nhập khác.",
			);
		}

		const email = (facebookProfile.email as string).toLowerCase();
		const facebookUserId = facebookProfile.id as string;
		const displayName = facebookProfile.name ?? email.split("@")[0] ?? email;

		let user = await prisma.user.findUnique({ where: { email }, include: userWithRoleInclude });

		if (user) {
			if (!user.isActive) {
				throw new Error("Forbidden: Tài khoản của bạn đã bị vô hiệu hóa.");
			}

			// Tài khoản đã tồn tại (vd. đăng ký trước đó bằng email/password) và giờ đăng
			// nhập bằng Facebook lần đầu -> liên kết thêm providerId, đồng thời coi như email
			// đã được xác thực (Facebook đã xác thực hộ), KHÔNG đổi mật khẩu hay xoá provider
			// "local" hiện có để user vẫn có thể đăng nhập bằng password.
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
					// Facebook đã xác thực quyền sở hữu email này -> không cần OTP xác thực lại.
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

		// Đồng bộ giỏ hàng cục bộ (localStorage, gửi kèm ở payload đăng nhập) vào DB — chỉ xảy ra
		// đúng 1 lần tại đây, ngay khi đăng nhập thành công. Không phải endpoint riêng.
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
	async forgotPassword(email: string) {
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
	async resetPassword(email: string, otpCode: string, newPassword: string) {
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
		const permissions = role.permissions.map(
			(rolePermission) => `${rolePermission.permission.resource}:${rolePermission.permission.name}`,
		);

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
			throw new Error(
				`Config: Role mặc định '${DEFAULT_CUSTOMER_ROLE_NAME}' chưa tồn tại. Vui lòng tạo role này trước (POST /api/rbac/roles).`,
			);
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

		await transporter.sendMail({
			from: `"E-commerce Support" <no-reply@example.com>`,
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
