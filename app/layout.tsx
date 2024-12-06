"use client"

import { Navbar, NavbarContent, NavbarItem, Link } from "@nextui-org/react";
import { usePathname } from "next/navigation";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");
  
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar isBordered isBlurred={false} className="w-full p-8">
          <NavbarContent justify="center" className="gap-8">
            <NavbarItem>
              <Link
                href="/"
                className={isActive('/') ? 'text-primary font-bold' : 'text-foreground'}
              >
                Wallet Management
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                href="/wallet"
                className={isActive('/wallet') ? 'text-primary font-bold' : 'text-foreground'}
              >
                Your Wallet
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Link
                href="/transaction"
                className={isActive('/transaction') ? 'text-primary font-bold' : 'text-foreground'}
              >
                Send Transaction
              </Link>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
        <main className="p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
