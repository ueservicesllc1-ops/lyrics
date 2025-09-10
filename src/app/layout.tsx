'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthStatus from "@/components/AuthStatus";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// export const metadata: Metadata = {
//   title: "My Setlist App",
//   description: "Your personal teleprompter and song manager.",
// };

function Header() {
    const pathname = usePathname();
    if (pathname.startsWith('/setlists/') || pathname.startsWith('/teleprompter')) {
      return null;
    }
    
  return (
     <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <h1 className="text-xl font-bold tracking-wider text-foreground uppercase">
                SETLIST.IO
            </h1>
            </Link>
            <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
                <AuthStatus />
            </nav>
            </div>
        </div>
    </header>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
          <title>My Setlist App</title>
          <meta name="description" content="Your personal teleprompter and song manager." />
      </head>
      <body className={`${inter.variable} font-sans bg-background`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
