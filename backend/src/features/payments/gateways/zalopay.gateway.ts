import axios from "axios";
import crypto from "crypto";
import { env } from "../../../config/dotenv.js";
import type { CreatePaymentUrlInput, GatewayVerifyResult, PaymentGateway } from "./gateway.types.js";
import { PAYMENT_METHOD } from "../payment.constant.js";

/** ZaloPay yêu cầu app_trans_id có tiền tố ngày theo giờ Việt Nam (UTC+7), định dạng "yyMMdd". */
function formatYyMmDd(date: Date): string {
	const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${String(vnTime.getUTCFullYear()).slice(2)}${pad(vnTime.getUTCMonth() + 1)}${pad(vnTime.getUTCDate())}`;
}

function hmacSha256(key: string, data: string): string {
	return crypto.createHmac("sha256", key).update(data).digest("hex");
}

/** Thông tin gắn kèm mỗi giao dịch, ZaloPay trả nguyên vẹn lại trong callback (parsed.embed_data)
 * -> dùng để tra ngược lại đúng Order.id mà không cần lưu app_trans_id riêng. */
interface ZaloPayEmbedData {
	orderId: number;
	redirecturl: string;
}

export const zalopayGateway: PaymentGateway = {
	method: PAYMENT_METHOD.zalopay,

	async createPaymentUrl(input: CreatePaymentUrlInput): Promise<string> {
		const now = new Date();
		// app_trans_id phải duy nhất trong ngày -> "<yyMMdd>_<orderId>_<timestamp>" vừa đúng định
		// dạng ZaloPay yêu cầu vừa tra ngược được Order.id khi verify callback.
		const appTransId = `${formatYyMmDd(now)}_${input.orderId}_${now.getTime()}`;
		const appTime = now.getTime();
		const embedData: ZaloPayEmbedData = { orderId: input.orderId, redirecturl: env.ZALOPAY_REDIRECT_URL };
		const embedDataStr = JSON.stringify(embedData);
		const itemStr = JSON.stringify([]);
		const amount = Math.round(input.amount);

		const macData = [env.ZALOPAY_APP_ID, appTransId, "user", amount, appTime, embedDataStr, itemStr].join("|");
		const mac = hmacSha256(env.ZALOPAY_KEY1, macData);

		const body = new URLSearchParams({
			app_id: env.ZALOPAY_APP_ID,
			app_trans_id: appTransId,
			app_user: "user",
			app_time: String(appTime),
			amount: String(amount),
			item: itemStr,
			embed_data: embedDataStr,
			description: `Thanh toan don hang ${input.orderNumber}`,
			bank_code: "",
			callback_url: env.ZALOPAY_CALLBACK_URL,
			mac,
		});

		try {
			const response = await axios.post(`${env.ZALOPAY_ENDPOINT}/v2/create`, body);
			const data = response.data;
			if (data?.return_code !== 1 || typeof data?.order_url !== "string") {
				throw new Error(`BadRequest: Không thể tạo giao dịch ZaloPay${data?.return_message ? ` (${data.return_message})` : ""}.`);
			}
			return data.order_url;
		} catch (error: any) {
			if (error instanceof Error && /^(BadRequest|NotFound|Config):/.test(error.message)) {
				throw error;
			}
			console.error("[zalopay:createPaymentUrl] Lỗi gọi ZaloPay API:", {
				code: error?.code,
				message: error?.message,
				responseData: error?.response?.data,
				endpoint: env.ZALOPAY_ENDPOINT,
			});
			const zpMessage = error?.response?.data?.return_message;
			throw new Error(`BadRequest: Không thể tạo giao dịch ZaloPay${zpMessage ? ` (${zpMessage})` : ""}.`);
		}
	},

	// ZaloPay redirect trình duyệt về `redirecturl` KHÔNG kèm chữ ký đáng tin cậy (chỉ có các
	// field thô như apptransid/status/amount) -> KHÔNG thể verify, chỉ dùng để hiển thị UI tạm
	// thời cho khách trong lúc chờ callback server-to-server xác nhận thật.
	verifyReturn(query: Record<string, unknown>): GatewayVerifyResult {
		const appTransId = typeof query.apptransid === "string" ? query.apptransid : null;
		const orderId = appTransId ? Number(appTransId.split("_")[1]) : NaN;
		return {
			isValid: false, // Không có chữ ký -> service tuyệt đối không dùng kết quả này để đổi trạng thái Payment
			orderId: Number.isFinite(orderId) ? orderId : null,
			transactionId: appTransId,
			isSuccess: query.status === "1",
			message: "ZaloPay return URL không có chữ ký xác thực — chỉ tham khảo để hiển thị UI.",
		};
	},

	// Callback server-to-server: body { data: string (JSON), mac: string }. ZaloPay CHỈ gọi
	// callback này khi giao dịch đã thanh toán thành công -> tới được đây + mac khớp = thành công.
	verifyIpn(payload: Record<string, unknown>): GatewayVerifyResult {
		const data = typeof payload.data === "string" ? payload.data : null;
		const mac = typeof payload.mac === "string" ? payload.mac : null;

		if (!data || !mac) {
			return { isValid: false, orderId: null, transactionId: null, isSuccess: false, message: "Thiếu data/mac." };
		}

		const computedMac = hmacSha256(env.ZALOPAY_KEY2, data);
		if (computedMac !== mac) {
			return { isValid: false, orderId: null, transactionId: null, isSuccess: false, message: "MAC không hợp lệ." };
		}

		try {
			const parsed = JSON.parse(data);
			const embed: ZaloPayEmbedData = JSON.parse(parsed.embed_data);
			return {
				isValid: true,
				orderId: Number.isFinite(embed.orderId) ? embed.orderId : null,
				transactionId: String(parsed.zp_trans_id ?? parsed.app_trans_id ?? ""),
				isSuccess: true,
				message: "Giao dịch thành công.",
			};
		} catch {
			return { isValid: false, orderId: null, transactionId: null, isSuccess: false, message: "Không parse được payload." };
		}
	},
};
