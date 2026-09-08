import { create } from "zustand";

interface SupportInboxState {
	hasNewActivity: boolean;
	markNewActivity: () => void;
	clearNewActivity: () => void;
}

export const useSupportInboxStore = create<SupportInboxState>((set) => ({
	hasNewActivity: false,
	markNewActivity: () => set({ hasNewActivity: true }),
	clearNewActivity: () => set({ hasNewActivity: false }),
}));
