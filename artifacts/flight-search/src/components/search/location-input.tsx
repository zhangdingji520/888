import { useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CitySelector, type CityAirport } from "./city-selector";

interface LocationInputProps {
  value: string;
  onChange: (iata: string, airport: CityAirport) => void;
  airport?: CityAirport | null;
  placeholder?: string;
  label?: string;
}

export function LocationInput({
  value,
  onChange,
  airport,
  placeholder = "选择城市或机场",
  label,
}: LocationInputProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      {label && (
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full justify-start h-14 text-base border-input bg-background/50 hover:bg-background shadow-none truncate",
          !value && "text-muted-foreground"
        )}
      >
        <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mr-3" />
        <span className="truncate">
          {airport ? (
            <span className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{airport.city}</span>
              <span className="text-muted-foreground text-sm">({airport.iata})</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
      </Button>

      <CitySelector
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(a) => onChange(a.iata, a)}
        currentValue={value}
      />
    </div>
  );
}
