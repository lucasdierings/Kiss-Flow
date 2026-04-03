"use client";

import { useState } from "react";

// ===== Types =====

export interface AlertItem {
  id: string;
  alert_type: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  action_suggested: string;
  contact_id?: string;
  contact_name?: string;
  dismissed: boolean;
  created_at: string;
}

interface AlertBannerProps {
  alerts: AlertItem[];
  onExecute: (alertId: string, action: string) => void;
  onDismiss: (alertId: string) => void;
}

// ===== Helpers =====

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d atras`;
  if (hours > 0) return `${hours}h atras`;
  if (minutes > 0) return `${minutes}min atras`;
  return "agora";
}

// ===== Priority Config =====

const PRIORITY_CONFIG = {
  critical: {
    color: "#e11d48",
    border: "border-[#e11d48]/30",
    glow: "shadow-[0_0_20px_rgba(225,29,72,0.15)]",
    bg: "bg-[#e11d48]/10",
    dotClass: "animate-pulse",
  },
  high: {
    color: "#d97706",
    border: "border-[#d97706]/20",
    glow: "shadow-[0_0_12px_rgba(217,119,6,0.1)]",
    bg: "bg-[#d97706]/10",
    dotClass: "",
  },
  medium: {
    color: "#7c3aed",
    border: "border-[#7c3aed]/15",
    glow: "",
    bg: "bg-[#7c3aed]/10",
    dotClass: "",
  },
  low: {
    color: "#262626",
    border: "border-[#333]/30",
    glow: "",
    bg: "bg-[#262626]",
    dotClass: "",
  },
} as const;

const MAX_VISIBLE = 3;

// ===== Component =====

export default function AlertBanner({ alerts, onExecute, onDismiss }: AlertBannerProps) {
  const [expanded, setExpanded] = useState(false);

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  if (activeAlerts.length === 0) return null;

  const visibleAlerts = expanded ? activeAlerts : activeAlerts.slice(0, MAX_VISIBLE);
  const hiddenCount = activeAlerts.length - MAX_VISIBLE;

  return (
    <div className="flex flex-col gap-3 mb-6">
      {visibleAlerts.map((alert) => {
        const config = PRIORITY_CONFIG[alert.priority];

        return (
          <div
            key={alert.id}
            className={`glass-strong rounded-xl px-5 py-3.5 flex items-start justify-between gap-4 border ${config.border} ${config.glow} transition-all duration-300`}
          >
            {/* Left: dot + content */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Priority dot */}
              <div className="mt-1 flex-shrink-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`}
                  style={{ backgroundColor: config.color }}
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-[#e5e5e5] truncate">
                    {alert.title}
                  </p>
                  {alert.contact_name && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#262626] text-[#a3a3a3] flex-shrink-0">
                      {alert.contact_name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#737373] leading-relaxed line-clamp-2">
                  {alert.description}
                </p>
                <p className="text-[10px] text-[#525252] mt-1">
                  {timeAgo(alert.created_at)}
                </p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
              <button
                onClick={() => onExecute(alert.id, alert.action_suggested)}
                className="px-3 py-1.5 text-xs rounded-lg text-white hover:brightness-110 transition-all duration-200 cursor-pointer"
                style={{ backgroundColor: config.color === "#262626" ? "#7c3aed" : config.color }}
              >
                Executar
              </button>
              <button
                onClick={() => onDismiss(alert.id)}
                className="px-3 py-1.5 text-xs rounded-lg bg-[#262626] text-[#737373] hover:bg-[#333] hover:text-[#a3a3a3] transition-colors duration-200 cursor-pointer"
              >
                Ignorar
              </button>
            </div>
          </div>
        );
      })}

      {/* Expand/collapse toggle */}
      {hiddenCount > 0 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="self-center text-xs text-[#737373] hover:text-[#a3a3a3] transition-colors duration-200 py-1 cursor-pointer"
        >
          Ver mais {hiddenCount} alerta{hiddenCount > 1 ? "s" : ""}
        </button>
      )}
      {expanded && activeAlerts.length > MAX_VISIBLE && (
        <button
          onClick={() => setExpanded(false)}
          className="self-center text-xs text-[#737373] hover:text-[#a3a3a3] transition-colors duration-200 py-1 cursor-pointer"
        >
          Mostrar menos
        </button>
      )}
    </div>
  );
}
