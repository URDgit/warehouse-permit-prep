import type { Metadata } from "next";
import "./globals.css";
import AuthStatus from "./AuthStatus";

export const metadata: Metadata = {
  title: "Storage-Rack Permit Package — Draft Preparation Aid",
  description:
    "Drafting aid for high-piled storage / storage-rack permit packages (Los Angeles). Output is a draft requiring licensed-engineer review.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="app-header">
          <div className="app-header__inner">
            <strong>Storage-Rack Permit Package</strong>
            <span className="app-header__sub">Draft Preparation Aid · California</span>
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
