"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/api";

// Client-side route guard: call at the top of a page that must not render
// its real content for an anonymous visitor (or one with the wrong role).

export function useRequireAuth(allowedRoles?: string[]): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, []);

  return ready;
}
