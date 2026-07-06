import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AuthStatus from "./AuthStatus";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: SITE.metaTitle,
  description: SITE.metaDescription,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="app-header__inner">
            <Link href="/" className="app-header__brand">{SITE.name}</Link>
            <span className="app-header__sub">High-piled storage permit research · California</span>
            <AuthStatus />
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="app-footer">
          {SITE.footerLine1}
          <br />
          {SITE.footerLine2}
        </footer>
      </body>
    </html>
  );
}
