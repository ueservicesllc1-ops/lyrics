import { Logo } from "@/components/icons";
import Link from "next/link";

export function Header() {
  return (
    <header className="py-3 px-4 md:px-6 border-b shrink-0">
      <div className="container mx-auto flex items-center gap-3">
        <Logo className="h-6 w-6 text-primary" />
        <Link href="/" className="text-xl font-semibold text-foreground">
          MySetListApp
        </Link>
      </div>
    </header>
  );
}
