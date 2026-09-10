import type { AddressTag } from "../../generated/prisma/index.js";
import type { ListAddressesParams } from "./user_address.validation.js";
interface AdminUpdateAddressInput {
    tag?: AddressTag;
    recipientName?: string;
    phoneNumber?: string;
    addressLine?: string;
    wardName?: string;
    districtName?: string;
    provinceName?: string;
    provinceId?: number;
    districtId?: number;
    wardCode?: string;
    isDefault?: boolean;
}
/**
 * Module quản trị (admin) cho toàn bộ địa chỉ trong hệ thống, tách biệt với phần
 * self-service (đặt trong feature "users") mà mỗi khách hàng dùng để quản lý địa chỉ của chính họ.
 * Dùng cho các thao tác xuyên-user: tra cứu, hỗ trợ khách hàng, chỉnh sửa/xóa thay khách khi cần.
 */
declare class UserAddressService {
    listAddresses(params: ListAddressesParams): Promise<{
        data: ({
            user: {
                email: string;
                id: number;
                name: string;
                phone: string | null;
            };
        } & {
            id: number;
            userId: number;
            createdAt: Date;
            recipientName: string;
            phoneNumber: string;
            addressLine: string;
            wardName: string;
            districtName: string;
            provinceName: string;
            provinceId: number;
            districtId: number;
            wardCode: string;
            tag: import("../../generated/prisma/index.js").$Enums.AddressTag;
            isDefault: boolean;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAddressById(addressId: number): Promise<{
        user: {
            email: string;
            id: number;
            name: string;
            phone: string | null;
        };
    } & {
        id: number;
        userId: number;
        createdAt: Date;
        recipientName: string;
        phoneNumber: string;
        addressLine: string;
        wardName: string;
        districtName: string;
        provinceName: string;
        provinceId: number;
        districtId: number;
        wardCode: string;
        tag: import("../../generated/prisma/index.js").$Enums.AddressTag;
        isDefault: boolean;
    }>;
    listAddressesByUser(userId: number): Promise<{
        id: number;
        userId: number;
        createdAt: Date;
        recipientName: string;
        phoneNumber: string;
        addressLine: string;
        wardName: string;
        districtName: string;
        provinceName: string;
        provinceId: number;
        districtId: number;
        wardCode: string;
        tag: import("../../generated/prisma/index.js").$Enums.AddressTag;
        isDefault: boolean;
    }[]>;
    adminUpdateAddress(addressId: number, data: AdminUpdateAddressInput): Promise<{
        id: number;
        userId: number;
        createdAt: Date;
        recipientName: string;
        phoneNumber: string;
        addressLine: string;
        wardName: string;
        districtName: string;
        provinceName: string;
        provinceId: number;
        districtId: number;
        wardCode: string;
        tag: import("../../generated/prisma/index.js").$Enums.AddressTag;
        isDefault: boolean;
    }>;
    adminDeleteAddress(addressId: number): Promise<void>;
    private getAddressOrThrow;
}
declare const _default: UserAddressService;
export default _default;
//# sourceMappingURL=user_address.service.d.ts.map