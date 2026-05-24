"use client";

import { ReactNode } from "react";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>VedaAI</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo3.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Desktop Layout */}
        <div className="hidden md:flex h-screen overflow-hidden bg-[#F0F0F0] print:flex print:h-auto print:overflow-visible print:bg-white">
          <div className="print:hidden">
            <Sidebar />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
            <div className="print:hidden">
              <Header />
            </div>
            <main className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col min-h-screen bg-white print:hidden">
          <div className="flex-1 overflow-y-auto pb-16 print:pb-0 print:overflow-visible">
            {children}
          </div>
          <div className="print:hidden">
            <MobileNav />
          </div>
        </div>
      </body>
    </html>
  );
}
