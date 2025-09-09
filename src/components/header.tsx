"use client";

import { Logo } from "@/components/icons";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function Header() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  return (
    <header className="py-3 px-4 md:px-6 border-b shrink-0 bg-card rounded-lg shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo className="h-6 w-6 text-foreground" />
          <Link href="/" className="text-xl font-semibold text-foreground">
            MySetListApp
          </Link>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
