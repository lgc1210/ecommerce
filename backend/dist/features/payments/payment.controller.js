import paymentService from "./payment.service.js";
import { handleServiceError } from "../../shared/service-error-handler.js";
// ==========================================
// Self-service: xem & xác nhận thanh toán đơn của chính mình
// ==========================================
export const getOwnPayment = async (req, res, next) => {
    try {
        const orderId = Number(req.params.orderId);
        const payment = await paymentService.getOwnPayment(req.user.id, orderId);
        res.status(200).json({ data: payment });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const confirmOwnPayment = async (req, res, next) => {
    try {
        const orderId = Number(req.params.orderId);
        const payment = await paymentService.confirmOwnPayment(req.user.id, orderId, req.body.transactionId);
        res.status(200).json({ message: "Xác nhận thanh toán thành công.", data: payment });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
/** Khách đổi phương thức thanh toán cho đơn của chính mình — chỉ khi đơn còn "pending" và chưa thanh toán online thành công (xem payment.service.ts -> changeOwnPaymentMethod). */
export const changeOwnPaymentMethod = async (req, res, next) => {
    try {
        const orderId = Number(req.params.orderId);
        const payment = await paymentService.changeOwnPaymentMethod(req.user.id, orderId, req.body.paymentMethod);
        res.status(200).json({ message: "Đã đổi phương thức thanh toán.", data: payment });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
// ==========================================
// Admin
// ==========================================
export const listPaymentsAdmin = async (req, res, next) => {
    try {
        const result = await paymentService.listPaymentsAdmin(req.query);
        res.status(200).json(result);
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const getPaymentById = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const payment = await paymentService.getPaymentById(id);
        res.status(200).json({ data: payment });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
export const updatePaymentStatus = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const payment = await paymentService.updatePaymentStatus(id, req.body.status, req.body.transactionId);
        res.status(200).json({ message: "Cập nhật trạng thái thanh toán thành công.", data: payment });
    }
    catch (error) {
        handleServiceError(error, res, next);
    }
};
//# sourceMappingURL=payment.controller.js.map