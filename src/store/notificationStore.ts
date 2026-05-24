import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  type: "assignment" | "general";
  redirectTo?: string;
}

interface NotificationStore {
  notifications: NotificationItem[];
  addNotification: (title: string, message: string, type: NotificationItem["type"], redirectTo?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (title, message, type, redirectTo) =>
        set((state) => {
          const newNotification: NotificationItem = {
            id: uuidv4(),
            title,
            message,
            timestamp: new Date().toISOString(),
            read: false,
            type,
            redirectTo,
          };
          return {
            notifications: [newNotification, ...state.notifications],
          };
        }),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    { name: "vedaai-notifications" }
  )
);
