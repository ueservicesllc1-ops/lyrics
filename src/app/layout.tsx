import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthStatus from "@/components/AuthStatus";

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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-blue-900 text-white">
              <div className="container flex h-14 items-center">
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
