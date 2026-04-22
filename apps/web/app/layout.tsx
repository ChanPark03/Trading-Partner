import "./globals.css";

import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Trading Partner",
  description: "Korean-first investment research assistant for US stocks, ETFs, and crypto.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

