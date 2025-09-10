import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthStatus from "@/components/AuthStatus";
import { Church } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbitron = Orbitron({ subsets: ["latin"], weight: "700", variable: "--font-orbitron" });

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
      <body className={`${inter.variable} ${orbitron.variable} font-sans`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-20 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Church className="h-6 w-6 text-primary glow-primary-text" />
                  <h1 className="text-2xl font-bold tracking-wider text-white font-display uppercase glow-primary-text" style={{ fontFamily: "var(--font-orbitron)" }}>
                    SETLIST.IO
                  </h1>
                </div>
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
