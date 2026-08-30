"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Warns before the user leaves an in-progress player review: native browser
// prompt for tab close/refresh, and a custom modal for in-app link clicks
// (sidebar, header, etc.) since those don't trigger beforeunload.
// Back/forward browser navigation isn't intercepted — only outright quitting
// (closing/reloading) or clicking away to another page.
export function useLeaveGuard(active: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || anchor.target === "_blank") return;
      if (href === window.location.pathname) return;

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(href);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    // Capture phase so this runs before Next's <Link> handler navigates.
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);

  return {
    pendingHref,
    confirmLeave: () => { if (pendingHref) router.push(pendingHref); },
    cancelLeave: () => setPendingHref(null),
  };
}
