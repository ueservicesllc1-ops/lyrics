
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Calendar as CalendarIcon, Loader2, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { saveSetlist } from "@/lib/actions/setlist-actions";
import type { Song } from "@/lib/songs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

type NewSetlistDialogProps = {
    currentSetlist: Song[];
    onSetlistSaved: () => void;
    userId: string;
};

export function NewSetlistDialog({ currentSetlist, onSetlistSaved, userId }: NewSetlistDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSave = () => {
    if (!name.trim()) {
        setError("El nombre de la setlist no puede estar vacío.");
        return;
    }
    if (!date) {
        setError("Por favor, selecciona una fecha.");
        return;
    }
   
    setError(null);

    startTransition(async () => {
        const songIds = currentSetlist.map(song => song.id);
        
        // Calling the client-side function directly
        const result = await saveSetlist({
            name,
            serviceDate: date,
            songIds,
            userId,
        });

        if (result.success) {
            toast({
                title: "¡Éxito!",
                description: "La setlist ha sido guardada correctamente."
            });
            onSetlistSaved();
            setName("");
            setDate(new Date());
            setOpen(false);
        } else {
            setError(result.error || "Ocurrió un error desconocido.");
        }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Setlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Setlist</DialogTitle>
          <DialogDescription>
            Dale un nombre y fecha a tu nueva setlist. Se guardará en tu cuenta.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nombre
            </Label>
            <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3" 
                placeholder="Ej: Servicio Dominical"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Fecha
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {error && (
             <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        )}
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={isPending}
        >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : "Save Setlist"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
