"use client";

import Link from "next/link";

interface UsageMeterProps {
  label: string;
  current: number;
  limit: number;
  showUpgrade?: boolean;
}

export function UsageMeter({ label, current, limit, showUpgrade = false }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;

  const getColor = () => {
    if (percentage > 80) return "#ef4444"; // red
    if (percentage >= 60) return "#eab308"; // yellow
    return "#22c55e"; // green
  };

  const color = getColor();

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "14px", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "14px", color: "#6b7280" }}>
          {current} / {limit}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "4px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      {showUpgrade && percentage > 80 && (
        <div style={{ marginTop: "8px", fontSize: "13px" }}>
          <Link
            href="/dashboard/billing"
            style={{ color: "#3b82f6", textDecoration: "underline" }}
          >
            Upgrade your plan for more capacity
          </Link>
        </div>
      )}
    </div>
  );
}
