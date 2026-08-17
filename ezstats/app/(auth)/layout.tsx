import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import AuthShowcasePanel from "@/components/auth/AuthShowcasePanel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#a7abb3] p-4 sm:p-6">
      <div className="w-full max-w-[1440px] lg:h-[760px] bg-white rounded-[40px] shadow-2xl grid grid-cols-1 lg:grid-cols-[1fr_1fr] overflow-hidden">
        <div className="flex flex-col px-8 py-10 sm:px-16 sm:py-12 overflow-y-auto">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 border border-border rounded-full pl-2.5 pr-4 py-1.5 mb-14"
          >
            <Image src="/e-logo.png" alt="" width={22} height={22} className="object-contain" />
            <span className="text-sm font-semibold text-text-primary">EzStats</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center w-full max-w-sm mx-auto">
            {children}
          </div>
        </div>

        <div className="hidden lg:block relative overflow-hidden bg-primary m-3 rounded-[32px]">
          <Link
            href="/"
            aria-label="Close"
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white hover:bg-bg-secondary flex items-center justify-center shadow-md transition-colors"
          >
            <X size={18} className="text-text-primary" />
          </Link>

          <AuthShowcasePanel />
        </div>
      </div>
    </div>
  );
}
