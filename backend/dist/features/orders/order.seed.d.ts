/**
 * Seed dữ liệu đơn hàng mẫu cho môi trường phát triển/demo.
 * Yêu cầu chạy SAU userSeed(), userAddressSeed(), productSeed() (cần userId/addressId/productSkuId đã tồn tại sẵn).
 * Chỉ chạy khi bảng orders hoàn toàn trống, để không ghi đè dữ liệu thật khi deploy lên môi trường có sẵn đơn hàng.
 * LƯU Ý: seed này KHÔNG trừ tồn kho tương ứng (khác với luồng checkout thật) vì chỉ phục vụ mục đích demo dữ liệu.
 */
export declare const orderSeed: () => Promise<void>;
//# sourceMappingURL=order.seed.d.ts.map