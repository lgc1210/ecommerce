import pkg from "../../generated/prisma/index.js";
import type { AddressInput, AddressUpdateInput, ListUsersParams } from "./user.type.js";
declare class UserService {
    updateOwnProfile(userId: number, data: {
        name?: string;
        phone?: string;
    }): Promise<Omit<{
        email: string;
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        passwordHash: string | null;
        providerId: string | null;
        phone: string | null;
        roleId: number;
        provider: pkg.$Enums.Provider;
        isVerified: boolean;
    }, "passwordHash">>;
    listOwnAddresses(userId: number): Promise<{
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
        tag: pkg.$Enums.AddressTag;
        isDefault: boolean;
    }[]>;
    createOwnAddress(userId: number, data: AddressInput): Promise<{
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
        tag: pkg.$Enums.AddressTag;
        isDefault: boolean;
    }>;
    updateOwnAddress(userId: number, addressId: number, data: AddressUpdateInput): Promise<{
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
        tag: pkg.$Enums.AddressTag;
        isDefault: boolean;
    }>;
    setDefaultOwnAddress(userId: number, addressId: number): Promise<{
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
        tag: pkg.$Enums.AddressTag;
        isDefault: boolean;
    } | null>;
    deleteOwnAddress(userId: number, addressId: number): Promise<void>;
    private getOwnedAddressOrThrow;
    createUser(data: {
        name: string;
        email: string;
        phone: string;
        roleId: number;
    }): Promise<Omit<{
        role: {
            id: number;
            name: string;
        };
    } & {
        email: string;
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        passwordHash: string | null;
        providerId: string | null;
        phone: string | null;
        roleId: number;
        provider: pkg.$Enums.Provider;
        isVerified: boolean;
    }, "passwordHash">>;
    private sendWelcomeEmail;
    listUsers(params: ListUsersParams): Promise<{
        data: Omit<{
            role: {
                id: number;
                name: string;
            };
        } & {
            email: string;
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            passwordHash: string | null;
            providerId: string | null;
            phone: string | null;
            roleId: number;
            provider: pkg.$Enums.Provider;
            isVerified: boolean;
        }, "passwordHash">[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUserById(id: number): Promise<Omit<{
        role: {
            id: number;
            name: string;
        };
        addresses: {
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
            tag: pkg.$Enums.AddressTag;
            isDefault: boolean;
        }[];
    } & {
        email: string;
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        passwordHash: string | null;
        providerId: string | null;
        phone: string | null;
        roleId: number;
        provider: pkg.$Enums.Provider;
        isVerified: boolean;
    }, "passwordHash">>;
    updateUserRole(id: number, roleId: number): Promise<Omit<{
        email: string;
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        passwordHash: string | null;
        providerId: string | null;
        phone: string | null;
        roleId: number;
        provider: pkg.$Enums.Provider;
        isVerified: boolean;
    }, "passwordHash">>;
    updateUserStatus(id: number, isActive: boolean): Promise<Omit<{
        email: string;
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        passwordHash: string | null;
        providerId: string | null;
        phone: string | null;
        roleId: number;
        provider: pkg.$Enums.Provider;
        isVerified: boolean;
    }, "passwordHash">>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=user.service.d.ts.map