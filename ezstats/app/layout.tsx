import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "EzStats",
  description: "Your team performance overview",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex h-screen overflow-hidden bg-bg-secondary font-sans`}
        suppressHydrationWarning
      >
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{children}</main>
      </body>
    </html>
  );
}
