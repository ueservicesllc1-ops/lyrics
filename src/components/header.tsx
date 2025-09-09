import { Logo } from "@/components/icons";
import Link from "next/link";

export function Header() {
  return (
    <header className="py-3 px-4 md:px-6 border-b shrink-0 bg-card rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2),_0_2px_4px_rgba(0,0,0,0.4)] bg-gradient-to-b from-[hsl(220_6%_85%)] to-[hsl(220_6%_75%)]">
      <div className="container mx-auto flex items-center gap-3">
        <Logo className="h-6 w-6 text-primary-foreground" />
        <Link href="/" className="text-xl font-semibold text-primary-foreground">
          MySetListApp
        </Link>
      </div>
    </header>
  );
}
