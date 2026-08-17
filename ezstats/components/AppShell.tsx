"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { TeamProvider } from "@/lib/TeamContext";

const AUTH_ROUTES = ["/login", "/register"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  if (isAuthRoute) {
    return <div className="w-full h-full overflow-y-auto">{children}</div>;
  }

  return (
    <TeamProvider>
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
    </TeamProvider>
  );
}
