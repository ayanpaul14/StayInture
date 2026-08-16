"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

// Only show the footer on landing page (/), explore (/explore), and profile (/profile)
const ALLOWED_FOOTER_PATHS = ["/", "/explore", "/profile"];

export default function ConditionalFooter() {
  const pathname = usePathname();

  const isAllowed = ALLOWED_FOOTER_PATHS.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  });

  if (!isAllowed) return null;
  return <Footer />;
}