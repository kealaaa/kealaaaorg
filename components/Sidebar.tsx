"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { LayoutGrid, LogOut, ChevronDown, Settings, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CRM_URL = process.env.NEXT_PUBLIC_CRM_URL || "https://ops.keala.io";
const RESEARCH_URL =
  process.env.NEXT_PUBLIC_RESEARCH_URL || "https://research.keala.io";

export function Sidebar({ mobile }: { mobile?: boolean } = {}) {
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.app_metadata?.role === "admin") setIsAdmin(true);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className={mobile ? undefined : "sidebar-desktop"}
      style={{
        width: mobile ? "100%" : 220,
        minHeight: "100vh",
        background: "#0f1923",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 2.25rem", marginBottom: "2rem" }}>
        <Image
          src="/KealaLogo.png"
          alt="Keala Advisors"
          width={120}
          height={40}
          style={{
            objectFit: "contain",
            objectPosition: "left",
            borderRadius: 4,
          }}
        />
      </div>
      <div style={{ padding: "0 0.75rem" }}>
        <button
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.55rem 0.75rem",
            borderRadius: 7,
            border: "none",
            background: "transparent",
            color: "#c9d1d9",
            fontSize: "0.82rem",
            fontFamily: "DM Sans, sans-serif",
            cursor: "pointer",
            transition: "color 0.15s",
            marginBottom: "0.25rem",
          }}
        >
          <LayoutGrid size={14} />
          <span>Apps</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => router.push("/dashboard/admin")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.55rem 0.75rem",
              borderRadius: 7,
              border: "none",
              background: "transparent",
              color: "#c9d1d9",
              fontSize: "0.82rem",
              fontFamily: "DM Sans, sans-serif",
              cursor: "pointer",
              transition: "color 0.15s",
              marginBottom: "0.25rem",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#c9d1d9")}
          >
            <ShieldCheck size={14} />
            <span>Admin</span>
          </button>
        )}
      </div>
      <div style={{ flex: 1 }} />

      {/* Settings + Logout */}
      <div style={{ padding: "0 0.75rem" }}>
        <button
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-profile-modal"))
          }
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.55rem 0.75rem",
            borderRadius: 7,
            border: "none",
            background: "transparent",
            color: "#c9d1d9",
            fontSize: "0.82rem",
            fontFamily: "DM Sans, sans-serif",
            cursor: "pointer",
            transition: "color 0.15s",
            marginBottom: "0.25rem",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#c9d1d9")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a94a6")}
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.55rem 0.75rem",
            borderRadius: 7,
            border: "none",
            background: "transparent",
            color: "#c9d1d9",
            fontSize: "0.82rem",
            fontFamily: "DM Sans, sans-serif",
            cursor: "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fc8181")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8a94a6")}
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.75rem",
        borderRadius: 7,
        color: "#6b7280",
        fontSize: "0.875rem",
        fontFamily: "DM Sans, sans-serif",
        textDecoration: "none",
        transition: "background 0.15s, color 0.15s",
        marginBottom: "0.1rem",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        e.currentTarget.style.color = "#e2e8f0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#6b7280";
      }}
    >
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#4a5568",
          flexShrink: 0,
        }}
      />
      {label}
    </a>
  );
}
