// src/hooks/use-notifications.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/baseClientbyG";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notifications.list(),
  });
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => base44.entities.Notifications.unreadCount(),
    refetchInterval: 60_000, // rafraîchit toutes les 60s (optionnel)
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => base44.entities.Notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}