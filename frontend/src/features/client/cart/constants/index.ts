/**
 * Query key cho giỏ hàng server (khách đã đăng nhập). Tách riêng ra file này (thay vì khai
 * báo ngay trong hooks/index.ts) để features/auth/hooks/useAuth.ts có thể import mà không
 * tạo vòng lặp: cart/hooks -> auth/hooks (dùng useAuth) và auth/hooks -> cart (dùng
 * CART_QUERY_KEY + useCartStore) là 2 chiều phụ thuộc riêng biệt, không đụng nhau nếu
 * hằng số này nằm ở 1 module không import gì từ auth.
 */
export const CART_QUERY_KEY = ["client", "cart"] as const;
