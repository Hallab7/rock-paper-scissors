// components/RouteTracker.jsx
"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function RouteTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef(null);

  useEffect(() => {
    if (lastPathRef.current) {
      sessionStorage.setItem("previousPath", lastPathRef.current);
    }
    lastPathRef.current = pathname;
  }, [pathname]);

  return null;
}
