import apiClient from "../../../../configs/apis";
import type { BroadcastNotificationPayload } from "../types";

const adminNotificationService = {
	broadcast: (payload: BroadcastNotificationPayload) => apiClient.post<{ message: string; sentCount: number }>("/notifications/broadcast", payload),
};

export default adminNotificationService;
