import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthStatus from "@/components/AuthStatus";
import { Church } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full">
              <div className="container flex h-20 items-center justify-between">
                <div className="flex items-center gap-4">
                  <Church className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl font-bold tracking-wider text-white">DASHBOARD</h1>
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
