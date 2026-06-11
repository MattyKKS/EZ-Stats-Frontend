"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  Upload,
  BarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, CSSProperties } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────
const GREEN      = "#1a7a4a";
const GREEN_BG   = "#f0faf5";   // active background
const GRAY_TEXT  = "#4b5563";
const HOVER_BG   = "#f3f4f6";
const SIDEBAR_W  = 256;
const SIDEBAR_W_COLLAPSED = 72;

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/team-profile", label: "Team Profile", icon: UserCircle      },
  { href: "/upload",       label: "Upload Video", icon: Upload           },
  { href: "/analysis",     label: "Analysis",     icon: BarChart2        },
];

// ── Nav links ──────────────────────────────────────────────────────────────────
function NavLinks({ showLabels, pathname }: { showLabels: boolean; pathname: string }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        const isHovered = hovered === href;

        const linkStyle: CSSProperties = {
          display: "flex",
          alignItems: "center",
          gap: showLabels ? 12 : 0,
          justifyContent: showLabels ? "flex-start" : "center",
          padding: showLabels ? "10px 12px" : "10px 0",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 500,
          textDecoration: "none",
          position: "relative",
          color: active ? GREEN : GRAY_TEXT,
          backgroundColor: active ? GREEN_BG : isHovered ? HOVER_BG : "transparent",
          transition: "background-color 0.15s, color 0.15s",
        };

        return (
          <Link
            key={href}
            href={href}
            title={!showLabels ? label : undefined}
            style={linkStyle}
            onMouseEnter={() => setHovered(href)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Right-side active indicator */}
            {active && (
              <span
                style={{
                  position: "absolute",
                  right: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 4,
                  height: 28,
                  backgroundColor: GREEN,
                  borderRadius: "4px 0 0 4px",
                }}
              />
            )}
            <Icon size={18} style={{ flexShrink: 0, color: active ? GREEN : GRAY_TEXT }} />
            {showLabels && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

// ── Logout button ──────────────────────────────────────────────────────────────
function LogoutBtn({ showLabel }: { showLabel: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ padding: showLabel ? "0 12px 28px" : "0 12px 28px" }}>
      <button
        title={!showLabel ? "Logout" : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: showLabel ? 12 : 0,
          justifyContent: showLabel ? "flex-start" : "center",
          width: "100%",
          padding: showLabel ? "10px 12px" : "10px 0",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 500,
          background: hovered ? HOVER_BG : "transparent",
          border: "none",
          cursor: "pointer",
          color: GRAY_TEXT,
          transition: "background-color 0.15s",
        }}
      >
        <LogOut size={18} style={{ flexShrink: 0 }} />
        {showLabel && <span>Logout</span>}
      </button>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname   = usePathname();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // ── Shared sidebar body ────────────────────────────────────────────────────
  function SidebarBody({ showLabels }: { showLabels: boolean }) {
    return (
      <>
        <NavLinks showLabels={showLabels} pathname={pathname} />
        <LogoutBtn showLabel={showLabels} />
      </>
    );
  }

  // ── Header row (logo + title + collapse btn) ───────────────────────────────
  function SidebarHeader({
    showCollapse,
    onCollapse,
    onClose,
  }: {
    showCollapse: boolean;
    onCollapse?:  () => void;
    onClose?:     () => void;
  }) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
          padding: "0 16px",
          flexShrink: 0,
        }}
      >
        {/* Logo — hidden when collapsed */}
        {!collapsed && (
          <Image
            src="/logo.png"
            alt="EzStats"
            width={110}
            height={32}
            style={{ objectFit: "contain", flexShrink: 0 }}
          />
        )}

        {/* Close button — mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#f9fafb",
              cursor: "pointer",
              color: "#6b7280",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Collapse toggle — desktop */}
        {showCollapse && onCollapse && (
          <button
            onClick={onCollapse}
            style={{
              width: 28, height: 28,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              color: "#6b7280",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>
    );
  }

  const sidebarBase: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    height: "100vh",
    flexShrink: 0,
  };

  return (
    <>
      {/* ── Mobile top bar (<768px) ─────────────────────────────────────── */}
      <div
        style={{
          display: "none",
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
          height: 56,
          backgroundColor: "#fff",
          borderBottom: "1px solid #e5e7eb",
          alignItems: "center",
          gap: 12,
          padding: "0 16px",
        }}
        className="mobile-topbar"
      >
        <button
          onClick={() => setMobileOpen(true)}
          style={{ padding: 6, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer" }}
        >
          <Menu size={22} color={GRAY_TEXT} />
        </button>
        <Image src="/logo.png" alt="EzStats" width={100} height={32} style={{ objectFit: "contain" }} />
      </div>

      {/* ── Mobile overlay ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── Mobile drawer ───────────────────────────────────────────────── */}
      <aside
        style={{
          ...sidebarBase,
          position: "fixed", top: 0, left: 0, zIndex: 50,
          width: SIDEBAR_W,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}
        className="mobile-drawer"
      >
        <SidebarHeader
          showCollapse={false}
          onClose={() => setMobileOpen(false)}
        />
        <SidebarBody showLabels={true} />
      </aside>

      {/* ── Desktop sidebar (≥768px) ─────────────────────────────────────── */}
      <aside
        style={{
          ...sidebarBase,
          width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W,
          transition: "width 0.3s ease",
        }}
        className="desktop-sidebar"
      >
        <SidebarHeader
          showCollapse={true}
          onCollapse={() => setCollapsed((c) => !c)}
        />
        <SidebarBody showLabels={!collapsed} />
      </aside>

      {/* ── Global responsive styles ─────────────────────────────────────── */}
      <style>{`
        @media (max-width: 767px) {
          .mobile-topbar  { display: flex !important; }
          .desktop-sidebar { display: none !important; }
        }
        @media (min-width: 768px) {
          .mobile-topbar   { display: none   !important; }
          .mobile-drawer   { display: none   !important; }
          .mobile-overlay  { display: none   !important; }
          .desktop-sidebar { display: flex   !important; }
        }
      `}</style>
    </>
  );
}
