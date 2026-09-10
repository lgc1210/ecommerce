import { z } from "zod";
export declare const UpdateOwnProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateAddressSchema: z.ZodObject<{
    body: z.ZodObject<{
        tag: z.ZodOptional<z.ZodEnum<{
            home: "home";
            office: "office";
        }>>;
        recipientName: z.ZodString;
        phoneNumber: z.ZodString;
        addressLine: z.ZodString;
        wardName: z.ZodString;
        districtName: z.ZodString;
        provinceName: z.ZodString;
        provinceId: z.ZodNumber;
        districtId: z.ZodNumber;
        wardCode: z.ZodString;
        isDefault: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateAddressSchema: z.ZodObject<{
    params: z.ZodObject<{
        addressId: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        tag: z.ZodOptional<z.ZodEnum<{
            home: "home";
            office: "office";
        }>>;
        recipientName: z.ZodOptional<z.ZodString>;
        phoneNumber: z.ZodOptional<z.ZodString>;
        addressLine: z.ZodOptional<z.ZodString>;
        wardName: z.ZodOptional<z.ZodString>;
        districtName: z.ZodOptional<z.ZodString>;
        provinceName: z.ZodOptional<z.ZodString>;
        provinceId: z.ZodOptional<z.ZodNumber>;
        districtId: z.ZodOptional<z.ZodNumber>;
        wardCode: z.ZodOptional<z.ZodString>;
        isDefault: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const AddressIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        addressId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ListUsersQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        roleId: z.ZodOptional<z.ZodString>;
        isActive: z.ZodOptional<z.ZodEnum<{
            false: "false";
            true: "true";
        }>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UserIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CreateUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodEmail;
        phone: z.ZodString;
        roleId: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateUserRoleSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        roleId: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UpdateUserStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        isActive: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=user.validation.d.ts.map