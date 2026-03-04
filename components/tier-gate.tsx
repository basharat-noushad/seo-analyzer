"use client";

import { ReactNode } from "react";
import Link from "next/link";

const tierHierarchy: Record<string, number> = {
  free: 0,
  pro: 1,
  agency: 2,
};

interface TierGateProps {
  requiredTier: string;
  currentTier: string;
  children: ReactNode;
  featureName: string;
}

export function TierGate({ requiredTier, currentTier, children, featureName }: TierGateProps) {
  const currentLevel = tierHierarchy[currentTier] ?? 0;
  const requiredLevel = tierHierarchy[requiredTier] ?? 0;

  if (currentLevel >= requiredLevel) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          opacity: 0.4,
          pointerEvents: "none",
          userSelect: "none",
          filter: "blur(2px)",
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          borderRadius: "8px",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "24px", marginBottom: "8px" }}>&#128274;</div>
        <p style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
          Upgrade to {requiredTier} to access {featureName}
        </p>
        <Link
          href="/dashboard/billing"
          style={{
            display: "inline-block",
            padding: "8px 16px",
            backgroundColor: "#3b82f6",
            color: "#ffffff",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          View Plans
        </Link>
      </div>
    </div>
  );
}
