// src/components/reminders/NotificationBell.jsx
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
} from "@/hooks/use-notifications";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationBell() {
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationsCount();
  const markAsReadMutation = useMarkNotificationAsRead();

  const hasNotifications = notifications.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 sm:h-9 sm:w-9"
        >
          <Bell className="h-4 w-4 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 text-[10px] text-white px-1.5 py-[1px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel>Rappels de paiement</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {!hasNotifications && (
          <div className="px-3 py-6 text-center text-sm text-slate-500">
            Aucune notification.
          </div>
        )}

        {notifications.map((n) => (
          <DropdownMenuItem
            key={n.id}
            className={`flex flex-col items-start gap-0.5 whitespace-normal ${
              !n.read ? "bg-slate-50" : ""
            }`}
            onClick={() => {
              if (!n.read && !markAsReadMutation.isPending) {
                markAsReadMutation.mutate(n.id);
              }
            }}
          >
            <div className="flex w-full justify-between items-center gap-2">
              <span className="text-xs font-semibold text-slate-800">
                {n.title}
              </span>
              {!n.read && (
                <span className="text-[10px] px-1.5 py-[1px] rounded-full bg-amber-100 text-amber-700">
                  Nouveau
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 break-words">
              {n.message}
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5">
              {formatDate(n.created_at)}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}