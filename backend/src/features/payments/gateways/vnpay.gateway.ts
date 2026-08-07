import crypto from "crypto";
import { env } from "../../../config/dotenv.js";
import type { CreatePaymentUrlInput, GatewayVerifyResult, PaymentGateway } from "./gateway.types.js";
import { PaymentMethod } from "../../../generated/prisma/index.js";

/** VNPay yêu cầu vnp_CreateDate/vnp_ExpireDate theo giờ Việt Nam (UTC+7), bất kể múi giờ máy chủ chạy Node là gì. */
function formatVnpDate(date: Date): string {
	const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
	const pad = (n: number) => String(n).padStart(2, "0");
	return vnTime.getUTCFullYear().toString() + pad(vnTime.getUTCMonth() + 1) + pad(vnTime.getUTCDate()) + pad(vnTime.getUTCHours()) + pad(vnTime.getUTCMinutes()) + pad(vnTime.getUTCSeconds());
}

/**
 * Sắp xếp params theo thứ tự alphabet rồi encode đúng chuẩn VNPay (dùng "+" thay cho khoảng
 * trắng thay vì "%20"), ký HMAC-SHA512 bằng VNP_HASHSECRET. Dùng CHUNG 1 hàm cho cả bước tạo URL
 * lẫn bước verify return/IPN để đảm bảo cách encode luôn nhất quán 2 chiều.
 */
function signParams(params: Record<string, string>): { query: string; hash: string } {
	const sortedKeys = Object.keys(params)
		.filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
		.sort();

	const pairs = sortedKeys.map((key) => `${key}=${encodeURIComponent(params[key]!).replace(/%20/g, "+")}`);
	const signData = pairs.join("&");
	const hash = crypto.createHmac("sha512", env.VNP_HASHSECRET).update(Buffer.from(signData, "utf-8")).digest("hex");

	return { query: signData, hash };
}

/** Chuẩn hóa payload query/body (Express parse thành string hoặc string[]) về Record<string,string> thuần. */
function toStringParams(payload: Record<string, unknown>): Record<string, string> {
	const result: Record<string, string> = {};
	for (const [key, value] of Object.entries(payload)) {
		if (typeof value === "string") result[key] = value;
	}
	return result;
}

function verify(payload: Record<string, unknown>): GatewayVerifyResult {
	const params = toStringParams(payload);
	const secureHash = params.vnp_SecureHash;
	delete params.vnp_SecureHash;
	delete params.vnp_SecureHashType;
	if (!secureHash) {
		return { isValid: false, orderId: null, transactionId: null, isSuccess: false, message: "Thiếu vnp_SecureHash." };
	}
	const { hash: computedHash } = signParams(params);
	if (computedHash.toLowerCase() !== secureHash.toLowerCase()) {
		return { isValid: false, orderId: null, transactionId: null, isSuccess: false, message: "Chữ ký không hợp lệ." };
	}
	// vnp_TxnRef được tạo dạng "<orderId>-<timestamp>" (xem createPaymentUrl) để luôn duy nhất
	// theo từng lượt thử thanh toán mà vẫn tra ngược được đúng Order.id.
	const orderId = Number(params.vnp_TxnRef?.split("-")[0]);
	// vnp_TransactionStatus chỉ có ở 1 số phiên bản callback; nếu thiếu thì chỉ xét vnp_ResponseCode.
	const isSuccess = params.vnp_ResponseCode === "00" && (params.vnp_TransactionStatus ?? "00") === "00";
	return {
		isValid: true,
		orderId: Number.isFinite(orderId) ? orderId : null,
		transactionId: params.vnp_TransactionNo || params.vnp_TxnRef || null,
		isSuccess,
		message: isSuccess ? "Giao dịch thành công." : `VNPay trả về mã lỗi ${params.vnp_ResponseCode}.`,
	};
}

export const vnpayGateway: PaymentGateway = {
	method: PaymentMethod.vnpay,

	async createPaymentUrl(input: CreatePaymentUrlInput): Promise<string> {
		const now = new Date();
		const txnRef = `${input.orderId}-${now.getTime()}`;

		const params: Record<string, string> = {
			vnp_Version: "2.1.0",
			vnp_Command: "pay",
			vnp_TmnCode: env.VNP_TMNCODE,
			// VNPay yêu cầu amount * 100 (đơn vị nhỏ nhất, không có phần thập phân)
			vnp_Amount: String(Math.round(input.amount) * 100),
			vnp_CurrCode: "VND",
			vnp_TxnRef: txnRef,
			vnp_OrderInfo: input.orderInfo,
			vnp_OrderType: "other",
			vnp_Locale: "vn",
			vnp_ReturnUrl: env.VNP_RETURNURL,
			vnp_IpAddr: input.ipAddress,
			vnp_CreateDate: formatVnpDate(now),
			vnp_ExpireDate: formatVnpDate(new Date(now.getTime() + 15 * 60 * 1000)), // Hết hạn sau 15 phút
		};

		const { query, hash } = signParams(params);
		return `${env.VNP_URL}?${query}&vnp_SecureHash=${hash}`;
	},

	// Return (redirect trình duyệt) và IPN (server-to-server) của VNPay dùng CHUNG 1 cơ chế ký
	// (vnp_SecureHash trên cùng bộ tham số) nên verify giống hệt nhau.
	verifyReturn: verify,
	verifyIpn: verify,
};
