import { Logo } from "@/components/icons";
import Link from "next/link";

export function Header() {
  return (
    <header className="py-4 px-4 md:px-6 border-b border-primary/10">
      <div className="container mx-auto flex items-center gap-3">
        <Logo className="h-8 w-8 text-primary" />
        <Link href="/" className="text-2xl font-bold font-headline text-foreground">
          MySetListApp
        </Link>
      </div>
    </header>
  );
}
