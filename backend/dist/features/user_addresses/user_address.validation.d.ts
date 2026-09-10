import { z } from "zod";
export declare const ListAddressesQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
        userId: z.ZodOptional<z.ZodString>;
        tag: z.ZodOptional<z.ZodEnum<{
            home: "home";
            office: "office";
        }>>;
        province: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const AddressIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        addressId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const UserIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const AdminUpdateAddressSchema: z.ZodObject<{
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
export type ListAddressesParams = z.infer<typeof ListAddressesQuerySchema>["query"];
export type AdminUpdateAddressInput = z.infer<typeof AdminUpdateAddressSchema>["body"];
//# sourceMappingURL=user_address.validation.d.ts.map