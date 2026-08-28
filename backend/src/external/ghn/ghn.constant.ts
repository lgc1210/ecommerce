// GHN có rất nhiều trạng thái vận chuyển chi tiết (xem tài liệu callback GHN), trong khi hệ thống
// mình chỉ có 5 trạng thái xử lý đơn giản (pending/processing/shipped/delivered/cancelled) — đây
// là bảng rút gọn, chỉ map những trạng thái đủ rõ ràng, dùng cho webhook nhận cập nhật từ GHN.
// GHN có rất nhiều trạng thái vận chuyển chi tiết (xem tài liệu callback GHN), trong khi hệ thống
// mình chỉ có 5 trạng thái xử lý đơn giản (pending/processing/shipped/delivered/cancelled) — đây
// là bảng rút gọn, chỉ map những trạng thái đủ rõ ràng, dùng cho webhook nhận cập nhật từ GHN.
//
// "ready_to_pick" -> "picked": đơn đã được GHN xác nhận/shipper đang lấy hàng, NHƯNG CHƯA thực sự
// rời khỏi kho/cửa hàng để di chuyển tới khách -> vẫn tính là "processing" (đang xử lý), không
// phải "shipped" (đang giao) — tránh nhảy cóc bỏ qua bước "Đang xử lý" ở màn theo dõi đơn hàng.
export const GHN_PROCESSING_STATUSES = new Set(["ready_to_pick", "picking", "money_collect_picking", "picked"]);
// Chỉ khi hàng thực sự rời kho, đang trên đường tới khách mới tính là "shipped".
export const GHN_SHIPPED_STATUSES = new Set(["storing", "transporting", "sorting", "delivering", "money_collect_delivering"]);
export const GHN_DELIVERED_STATUSES = new Set(["delivered"]);
// Coi các trạng thái "giao thất bại/trả hàng/thất lạc/hư hỏng" là hủy đơn ở hệ thống mình — đơn
// giản hóa vì hệ thống chưa có trạng thái riêng cho từng trường hợp này.
export const GHN_CANCELLED_STATUSES = new Set(["cancel", "return", "returned", "return_transporting", "return_sorting", "returning", "return_fail", "damage", "lost", "exception"]);

// GHN giới hạn giá trị khai báo bảo hiểm (insurance_value) tối đa 5.000.000đ ở mức phí cơ bản;
// vượt mức này cần phụ phí bảo hiểm mở rộng mà hệ thống hiện chưa hỗ trợ, nên tạm chặn ở mức trần này.
export const GHN_MAX_INSURANCE_VALUE = 5_000_000;
