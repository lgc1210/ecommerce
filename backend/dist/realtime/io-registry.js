/**
 * Module RIÊNG, không import gì từ `features/` — chỉ giữ instance `io` + tên các room dùng chung.
 * Tách khỏi `socket.server.ts` để tránh vòng lặp import: `socket.server.ts` cần import handler của
 * từng feature (`conversation.socket.ts`, `message.socket.ts`) để đăng ký listener, còn các
 * `*.service.ts` (chạy được từ cả REST lẫn socket) lại cần gọi `getIO()` để bắn realtime sau khi
 * mutation thành công — nếu để chung 1 file, `service.ts` -> `socket.server.ts` -> `*.socket.ts` ->
 * `service.ts` sẽ tạo vòng lặp. Tách ra file này thì cả 2 phía chỉ phụ thuộc 1 chiều vào đây.
 */
export const STAFF_SUPPORT_ROOM = "staff:support";
export const conversationRoom = (conversationId) => `conversation:${conversationId}`;
let ioInstance = null;
export const setIO = (io) => {
    ioInstance = io;
};
/**
 * Lấy instance `io` đã khởi tạo — dùng ở SERVICE layer để bắn realtime ngay sau khi 1 hành động
 * (gửi tin, nhận xử lý, đổi trạng thái...) thành công, bất kể hành động đó tới từ REST hay từ
 * chính socket — tránh viết lặp logic emit ở 2 nơi.
 *
 * Trả về `null` nếu socket server chưa khởi tạo (vd chạy unit test không cần realtime) — caller
 * PHẢI tự kiểm tra null và bỏ qua việc emit, KHÔNG được để việc thiếu socket làm hỏng luồng nghiệp
 * vụ chính (REST API vẫn phải hoạt động đúng dù không có realtime).
 */
export const getIO = () => ioInstance;
//# sourceMappingURL=io-registry.js.map