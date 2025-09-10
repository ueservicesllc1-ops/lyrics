import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthStatus from "@/components/AuthStatus";
import { Home } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "My Setlist App",
  description: "Your personal teleprompter and song manager.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-14 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  <h1 className="text-xl font-bold tracking-wider text-white uppercase">
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
            <main className="flex-grow">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
