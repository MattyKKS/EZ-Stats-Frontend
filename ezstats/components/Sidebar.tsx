"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import {
  LayoutDashboard,
  UserCircle,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

const navItems: {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: { href: string; label: string }[];
}[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    subItems: [
      { href: "/match-statistics", label: "Match statistics" },
      { href: "/player-statistics", label: "Player statistics" },
    ],
  },
  { href: "/team-profile", label: "Team Profile", icon: UserCircle },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NewAnalysisButton({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/upload"
      onClick={onClick}
      title={collapsed ? "New Analysis" : undefined}
      className={[
        "inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-[16px] no-underline transition-colors",
        collapsed ? "w-10 h-10 mx-auto" : "gap-1.5 px-3 py-[10px]",
      ].join(" ")}
    >
      <Plus size={16} />
      {!collapsed && "New Analysis"}
    </Link>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  indent,
  onClick,
}: {
  href: string;
  label: string;
  icon?: LucideIcon;
  active: boolean;
  collapsed: boolean;
  indent?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={[
        "relative flex items-center gap-3 rounded-[8px] text-sm font-medium no-underline transition-colors duration-150",
        collapsed ? "justify-center py-[10px]" : indent ? "justify-start py-2 pl-12 pr-3" : "justify-start pl-4 pr-3 py-[10px]",
        active ? "bg-primary-bg text-primary" : "text-[#4b5563] hover:bg-bg-secondary",
      ].join(" ")}
    >
      {Icon && <Icon size={20} />}
      {!collapsed && <span>{label}</span>}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
      )}
    </Link>
  );
}

function NavLinks({
  collapsed,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 flex flex-col gap-4 px-3 py-5">
      <NewAnalysisButton collapsed={collapsed} onClick={onNavigate} />

      {navItems.map(({ href, label, icon, subItems }) => (
        <div key={href} className={subItems ? "flex flex-col gap-2" : undefined}>
          <NavLink
            href={href}
            label={label}
            icon={icon}
            active={isActive(pathname, href)}
            collapsed={collapsed}
            onClick={onNavigate}
          />
          {subItems && !collapsed &&
            subItems.map(sub => (
              <NavLink
                key={sub.href}
                href={sub.href}
                label={sub.label}
                active={isActive(pathname, sub.href)}
                collapsed={collapsed}
                indent
                onClick={onNavigate}
              />
            ))}
        </div>
      ))}
    </nav>
  );
}

//  Toggles the desktop sidebar between expanded and icon-only
function CollapseToggle({
  collapsed,
  onClick,
}: {
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <div className="px-3 pb-2">
      <button
        onClick={onClick}
        title={collapsed ? "Expand" : "Collapse"}
        className={[
          "flex items-center w-full rounded-[8px] text-sm font-medium text-[#4b5563] hover:bg-bg-secondary transition-colors",
          collapsed ? "justify-center py-[10px]" : "gap-3 px-3 py-[10px]",
        ].join(" ")}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </div>
  );
}

//  Logout — profile info now lives in the header's ProfileMenu
function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="px-3 pb-4">
      <button
        onClick={handleLogout}
        title={collapsed ? "Logout" : undefined}
        className={[
          "flex items-center w-full rounded-[10px] text-sm font-medium text-[#4b5563] hover:bg-bg-secondary transition-colors",
          collapsed ? "justify-center py-[10px]" : "gap-3 px-3 py-[10px]",
        ].join(" ")}
      >
        <LogOut size={20} />
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  );
}

//  Main sidebar
export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/*  Mobile */}
      <div className="flex md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-border z-40 items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-bg-secondary"
        >
          <Menu size={20} className="text-[#4b5563]" />
        </button>
        <Image
          src="/logo.png"
          alt="EzStats"
          width={90}
          height={28}
          className="ml-3 object-contain h-7 w-[90px]"
        />
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-64 h-full bg-white shadow-xl z-10">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <Image
                src="/logo.png"
                alt="EzStats"
                width={128}
                height={40}
                className="object-contain h-10 w-[128px]"
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-bg-secondary"
              >
                <X size={20} className="text-[#4b5563]" />
              </button>
            </div>
            <NavLinks
              collapsed={false}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
            <LogoutButton collapsed={false} />
          </div>
        </div>
      )}

      {/*  Desktop sidebar  */}
      <div
        className={[
          "hidden md:flex flex-col h-full bg-white border-r border-border flex-shrink-0 transition-all duration-200",
          collapsed ? "w-[72px]" : "w-64",
        ].join(" ")}
      >
        <NavLinks collapsed={collapsed} pathname={pathname} />
        <CollapseToggle collapsed={collapsed} onClick={() => setCollapsed(v => !v)} />
        <LogoutButton collapsed={collapsed} />
      </div>
    </>
  );
}
