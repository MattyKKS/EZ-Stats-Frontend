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
import { useState } from "react";

const navItems = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/team-profile", label: "Team Profile", icon: UserCircle      },
  { href: "/upload",       label: "Upload Video", icon: Upload           },
  { href: "/analysis",     label: "Analysis",     icon: BarChart2        },
];

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
    <nav className="flex-1 flex flex-col gap-1 px-3 py-5">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={[
              "relative flex items-center rounded-[10px] text-sm font-medium no-underline transition-colors duration-150",
              collapsed ? "justify-center py-[10px]" : "justify-start gap-3 px-3 py-[10px]",
              active
                ? "bg-primary-bg text-primary"
                : "text-[#4b5563] hover:bg-bg-secondary",
            ].join(" ")}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
            {active && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-l-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

//  Logout button 
function LogoutBtn({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="px-3 pb-4">
      <button
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
                width={100}
                height={32}
                className="object-contain h-8 w-[100px]"
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
            <LogoutBtn collapsed={false} />
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
        <div
          className={[
            "flex items-center h-14 border-b border-border px-3",
            collapsed ? "justify-center" : "justify-between",
          ].join(" ")}
        >
          {!collapsed && (
            <Image
              src="/logo.png"
              alt="EzStats"
              width={100}
              height={32}
              className="object-contain"
            />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-bg-secondary flex-shrink-0"
          >
            {collapsed ? (
              <ChevronRight size={16} className="text-[#4b5563]" />
            ) : (
              <ChevronLeft size={16} className="text-[#4b5563]" />
            )}
          </button>
        </div>

        <NavLinks collapsed={collapsed} pathname={pathname} />
        <LogoutBtn collapsed={collapsed} />
      </div>
    </>
  );
}
