/** Chuẩn hóa lỗi từ GHN/axios thành "BadRequest: ..." để handleServiceError trả 400 kèm message dễ hiểu. */
export function toGhnError(error: any, fallback: string): Error {
	const regex = /^(BadRequest|NotFound|Config):/;
	if (error instanceof Error && regex.test(error.message)) {
		return error;
	}
	const ghnMessage = error?.response?.data?.message;
	return new Error(
		`BadRequest: ${fallback}${ghnMessage ? ` (GHN: ${ghnMessage})` : ""}.`,
	);
}

// GHN trả ngày rỗng dưới nhiều dạng (null, chuỗi "null", mốc "0001-01-01...") nên gom về null hết.
export function normalizeGhnDate(value: unknown): string | null {
	if (
		typeof value !== "string" ||
		!value ||
		value === "null" ||
		value.startsWith("0001-")
	)
		return null;
	return value;
}

export type GhnPrintSize = "a5" | "80x80" | "50x72";

// Mỗi khổ giấy in có 1 đường dẫn riêng (xem tài liệu API "Print Order" của GHN) — lưu ý khổ 50x72 có path là "print52x70".
export const GHN_PRINT_PATH: Record<GhnPrintSize, string> = {
	a5: "printA5",
	"80x80": "print80x80",
	"50x72": "print52x70",
};
