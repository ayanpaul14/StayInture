"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";

// Pages that manage their own full-height layout shouldn't also have the
// marketing footer competing for vertical space underneath them - that's
// what was causing the "jumping" scroll on /messages.
const HIDE_FOOTER_ON = ["/messages"];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDE_FOOTER_ON.some((p) => pathname?.startsWith(p))) return null;
  return <Footer />;
}