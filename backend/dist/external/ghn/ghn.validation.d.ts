import { z } from "zod";
export declare const DistrictSchema: z.ZodObject<{
    query: z.ZodObject<{
        provinceId: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const WardSchema: z.ZodObject<{
    query: z.ZodObject<{
        districtId: z.ZodCoercedNumber<unknown>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=ghn.validation.d.ts.map