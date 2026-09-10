import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../../middlewares/authenticate.js";
export declare const getOrCreateOwnConversation: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
/** CHỈ ĐỌC — không tự tạo mới (khác getOrCreateOwnConversation ở trên, dùng cho nút "Chat"). Trả `data: null` nếu khách chưa từng chat, không phải lỗi. */
export declare const getOwnCurrentConversation: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOwnConversation: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markOwnConversationRead: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listConversationsAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getConversationAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const assignConversationToSelf: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateConversationStatus: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const markStaffConversationRead: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=conversation.controller.d.ts.map