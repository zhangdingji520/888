import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetPopularAirports, useSearchAirports, getSearchAirportsQueryKey } from "@workspace/api-client-react";
import type { Airport } from "@workspace/api-client-react";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
}

export function LocationInput({ value, onChange, placeholder = "Select city or airport", label, icon }: LocationInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: popularAirports = [], isLoading: isLoadingPopular } = useGetPopularAirports();
  const { data: searchResults = [], isLoading: isLoadingSearch } = useSearchAirports(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length > 1, queryKey: getSearchAirportsQueryKey({ q: debouncedQuery }) } }
  );

  const displayAirports = debouncedQuery.length > 1 ? searchResults : popularAirports;
  const isLoading = debouncedQuery.length > 1 ? isLoadingSearch : isLoadingPopular;

  const selectedAirport = [...popularAirports, ...searchResults].find((a) => a.iata === value);

  return (
    <div className="flex flex-col gap-1.5 flex-1 relative">
      {label && <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-14 text-base border-input bg-background/50 hover:bg-background shadow-none",
              !value && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-3 truncate">
              {icon || <MapPin className="h-5 w-5 text-muted-foreground" />}
              <span className="truncate">
                {selectedAirport ? (
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{selectedAirport.city}</span>
                    <span className="text-muted-foreground text-sm">({selectedAirport.iata})</span>
                  </span>
                ) : (
                  placeholder
                )}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search airports or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Searching..." : "No airports found."}
              </CommandEmpty>
              <CommandGroup heading={debouncedQuery.length > 1 ? "Search Results" : "Popular Destinations"}>
                {displayAirports.map((airport: Airport) => (
                  <CommandItem
                    key={airport.iata}
                    value={airport.iata}
                    onSelect={(currentValue) => {
                      onChange(airport.iata);
                      setOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center justify-between gap-2 p-3 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{airport.city} ({airport.iata})</span>
                      <span className="text-xs text-muted-foreground">{airport.name}, {airport.country}</span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 text-primary",
                        value === airport.iata ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
