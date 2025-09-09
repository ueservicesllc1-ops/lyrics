import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="pt-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/admin/songs" className="flex-1">
            <Button size="lg" className="w-full h-16 text-lg" variant="secondary">
              BIBLIOTECA
            </Button>
          </Link>
          <Link href="/setlists" className="flex-1">
            <Button size="lg" className="w-full h-16 text-lg" variant="secondary">
              SETLIST
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
