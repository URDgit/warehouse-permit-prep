import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import AuthStatus from "./AuthStatus";

export const metadata: Metadata = {
  title: "RackWright — Stamp-ready storage-rack permit packages",
  description:
    "RackWright helps California engineers and consultants assemble complete, code-cited high-piled storage / storage-rack permit packages for review, seal, and submittal. A drafting aid — you remain the engineer of record.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="app-header__inner">
            <Link href="/" className="app-header__brand">RackWright</Link>
            <span className="app-header__sub">Storage-rack permit packages · California</span>
            <AuthStatus />
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="app-footer">
          Preliminary drafting aid only — not an engineered or approved document. Requires
          review and stamp by a California-licensed professional engineer.
        </footer>
      </body>
    </html>
  );
}
