import pkg from "../../generated/prisma/index.js";
import { Prisma } from "../../generated/prisma/index.js";
import type { FacebookLoginInput, ForgotPasswordInput, GoogleLoginInput, LoginInput, RegisterInput, ResendOtpInput, ResetPasswordInput, VerifyOtpInput } from "./auth.validation.js";
declare class AuthService {
    register({ name, email, phone, password }: RegisterInput): Promise<Omit<{
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
    }, "passwordHash" | "providerId">>;
    verifyRegistrationOtp({ email, otpCode }: VerifyOtpInput): Promise<Omit<{
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
    }, "passwordHash" | "providerId">>;
    resendOtp({ email, type }: ResendOtpInput): Promise<void>;
    login({ email, password, cartItems: pendingCartItems }: LoginInput): Promise<{
        user: {
            role: {
                id: number;
                name: string;
            };
            permissions: string[];
            email: string;
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            phone: string | null;
            roleId: number;
            provider: pkg.$Enums.Provider;
            isVerified: boolean;
        };
        accessToken: string;
        refreshToken: string;
        cart: {
            totalItems: number;
            totalQuantity: number;
            subtotal: number;
            items: ({
                productSku: {
                    product: {
                        id: number;
                        name: string;
                        slug: string;
                        isActive: boolean;
                        thumbnailUrl: string | null;
                    } | null;
                    images: {
                        productSkuId: number;
                        sortOrder: number;
                        isPrimary: boolean;
                        id: number;
                        createdAt: Date | null;
                        imageUrl: string;
                        altText: string | null;
                    }[];
                } & {
                    id: number;
                    createdAt: Date | null;
                    updatedAt: Date | null;
                    productId: number | null;
                    sku: string;
                    price: Prisma.Decimal;
                    oldPrice: Prisma.Decimal | null;
                    stockQuantity: number;
                    variationDetails: Prisma.JsonValue;
                    weightGram: number;
                    lengthCm: number;
                    widthCm: number;
                    heightCm: number;
                };
            } & {
                productSkuId: number;
                quantity: number;
                id: number;
                cartId: number;
            })[];
            id: number;
            userId: number;
            createdAt: Date | null;
            updatedAt: Date | null;
        };
        skippedItems: {
            productSkuId: number;
            reason: "not_found" | "out_of_stock";
        }[];
    }>;
    loginWithGoogle({ accessToken: googleAccessToken, cartItems: pendingCartItems }: GoogleLoginInput): Promise<{
        user: {
            role: {
                id: number;
                name: string;
            };
            permissions: string[];
            email: string;
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            phone: string | null;
            roleId: number;
            provider: pkg.$Enums.Provider;
            isVerified: boolean;
        };
        accessToken: string;
        refreshToken: string;
        cart: {
            totalItems: number;
            totalQuantity: number;
            subtotal: number;
            items: ({
                productSku: {
                    product: {
                        id: number;
                        name: string;
                        slug: string;
                        isActive: boolean;
                        thumbnailUrl: string | null;
                    } | null;
                    images: {
                        productSkuId: number;
                        sortOrder: number;
                        isPrimary: boolean;
                        id: number;
                        createdAt: Date | null;
                        imageUrl: string;
                        altText: string | null;
                    }[];
                } & {
                    id: number;
                    createdAt: Date | null;
                    updatedAt: Date | null;
                    productId: number | null;
                    sku: string;
                    price: Prisma.Decimal;
                    oldPrice: Prisma.Decimal | null;
                    stockQuantity: number;
                    variationDetails: Prisma.JsonValue;
                    weightGram: number;
                    lengthCm: number;
                    widthCm: number;
                    heightCm: number;
                };
            } & {
                productSkuId: number;
                quantity: number;
                id: number;
                cartId: number;
            })[];
            id: number;
            userId: number;
            createdAt: Date | null;
            updatedAt: Date | null;
        };
        skippedItems: {
            productSkuId: number;
            reason: "not_found" | "out_of_stock";
        }[];
    }>;
    loginWithFacebook({ accessToken, cartItems: pendingCartItems }: FacebookLoginInput): Promise<{
        user: {
            role: {
                id: number;
                name: string;
            };
            permissions: string[];
            email: string;
            id: number;
            createdAt: Date | null;
            updatedAt: Date | null;
            name: string;
            isActive: boolean;
            phone: string | null;
            roleId: number;
            provider: pkg.$Enums.Provider;
            isVerified: boolean;
        };
        accessToken: string;
        refreshToken: string;
        cart: {
            totalItems: number;
            totalQuantity: number;
            subtotal: number;
            items: ({
                productSku: {
                    product: {
                        id: number;
                        name: string;
                        slug: string;
                        isActive: boolean;
                        thumbnailUrl: string | null;
                    } | null;
                    images: {
                        productSkuId: number;
                        sortOrder: number;
                        isPrimary: boolean;
                        id: number;
                        createdAt: Date | null;
                        imageUrl: string;
                        altText: string | null;
                    }[];
                } & {
                    id: number;
                    createdAt: Date | null;
                    updatedAt: Date | null;
                    productId: number | null;
                    sku: string;
                    price: Prisma.Decimal;
                    oldPrice: Prisma.Decimal | null;
                    stockQuantity: number;
                    variationDetails: Prisma.JsonValue;
                    weightGram: number;
                    lengthCm: number;
                    widthCm: number;
                    heightCm: number;
                };
            } & {
                productSkuId: number;
                quantity: number;
                id: number;
                cartId: number;
            })[];
            id: number;
            userId: number;
            createdAt: Date | null;
            updatedAt: Date | null;
        };
        skippedItems: {
            productSkuId: number;
            reason: "not_found" | "out_of_stock";
        }[];
    }>;
    refreshAccessToken(rawRefreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(rawRefreshToken: string | undefined): Promise<void>;
    forgotPassword({ email }: ForgotPasswordInput): Promise<void>;
    resetPassword({ email, otpCode, newPassword }: ResetPasswordInput): Promise<void>;
    getMe(userId: number): Promise<{
        role: {
            id: number;
            name: string;
        };
        permissions: string[];
        email: string;
        id: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        name: string;
        isActive: boolean;
        phone: string | null;
        roleId: number;
        provider: pkg.$Enums.Provider;
        isVerified: boolean;
    }>;
    private toAuthUser;
    private getDefaultCustomerRole;
    private issueOtp;
    private validateAndConsumeOtp;
    private sendOtpEmail;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map