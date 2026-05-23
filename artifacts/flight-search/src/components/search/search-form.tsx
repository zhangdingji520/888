import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationInput } from "./location-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FlightSearchInput, FlightSearchInputFlightClass } from "@workspace/api-client-react/src/generated/api.schemas";

interface SearchFormProps {
  onSearch: (data: FlightSearchInput) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date>();
  const [adults, setAdults] = useState("1");
  const [flightClass, setFlightClass] = useState<FlightSearchInputFlightClass>("Econom");

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;

    onSearch({
      origin,
      destination,
      date: format(date, "dd.MM.yyyy"),
      adults: parseInt(adults, 10),
      flightClass
    });
  };

  const isComplete = origin && destination && date;

  return (
    <div className="w-full max-w-5xl mx-auto -mt-16 sm:-mt-24 relative z-10 px-4 sm:px-6">
      <div className="bg-card rounded-2xl shadow-xl border p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Locations */}
            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-4 relative items-center">
              <LocationInput
                label="From"
                placeholder="Origin"
                value={origin}
                onChange={setOrigin}
              />
              
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hidden sm:flex rounded-full shrink-0 w-10 h-10 z-10 mx-[-20px] shadow-sm hover:bg-muted"
                onClick={handleSwap}
              >
                <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
              </Button>

              <LocationInput
                label="To"
                placeholder="Destination"
                value={destination}
                onChange={setDestination}
              />
            </div>

            {/* Date & Passengers */}
            <div className="flex flex-col sm:flex-row w-full gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Departure</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-14 justify-start text-left font-normal bg-background/50 hover:bg-background shadow-none text-base",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Travelers & Class</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-start text-left font-normal bg-background/50 hover:bg-background shadow-none text-base"
                    >
                      <Users className="mr-3 h-5 w-5 text-muted-foreground" />
                      <span className="truncate">
                        {adults} Traveler{parseInt(adults) > 1 ? "s" : ""}, {flightClass}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Adults</p>
                          <p className="text-xs text-muted-foreground">Age 12+</p>
                        </div>
                        <Select value={adults} onValueChange={setAdults}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="h-px bg-border my-2" />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Class</p>
                        </div>
                        <Select value={flightClass} onValueChange={(val: any) => setFlightClass(val)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Econom">Economy</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="First">First Class</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full md:w-auto px-8 h-14 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
              disabled={!isComplete || isLoading}
            >
              {isLoading ? "Searching Flights..." : "Search Flights"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
