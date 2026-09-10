import { z } from "zod";
export declare const RegisterSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodEmail;
        phone: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const LoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodEmail;
        password: z.ZodString;
        cartItems: z.ZodDefault<z.ZodArray<z.ZodObject<{
            productSkuId: z.ZodNumber;
            quantity: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const GoogleLoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        accessToken: z.ZodString;
        cartItems: z.ZodDefault<z.ZodArray<z.ZodObject<{
            productSkuId: z.ZodNumber;
            quantity: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const FacebookLoginSchema: z.ZodObject<{
    body: z.ZodObject<{
        accessToken: z.ZodString;
        cartItems: z.ZodDefault<z.ZodArray<z.ZodObject<{
            productSkuId: z.ZodNumber;
            quantity: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const VerifyOtpSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodEmail;
        otpCode: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ResendOtpSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodEmail;
        type: z.ZodEnum<{
            registration: "registration";
            password_reset: "password_reset";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodEmail;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ResetPasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodEmail;
        otpCode: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof RegisterSchema>["body"];
export type LoginInput = z.infer<typeof LoginSchema>["body"];
export type GoogleLoginInput = z.infer<typeof GoogleLoginSchema>["body"];
export type FacebookLoginInput = z.infer<typeof FacebookLoginSchema>["body"];
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>["body"];
export type ResendOtpInput = z.infer<typeof ResendOtpSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>["body"];
//# sourceMappingURL=auth.validation.d.ts.map