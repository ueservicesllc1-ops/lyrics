'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Setlist } from "@/app/setlists/page";
import { format } from "date-fns";

interface SetlistCardProps {
    setlist: Setlist;
}

export default function SetlistCard({ setlist }: SetlistCardProps) {
    // Firestore Timestamp to JS Date
    const date = setlist.date.toDate();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{setlist.name}</CardTitle>
                <CardDescription>{format(date, 'PPP')}</CardDescription>
            </CardHeader>
            <CardFooter>
                 <Button variant="outline" size="sm">Ver Detalles</Button>
            </CardFooter>
        </Card>
    );
}
