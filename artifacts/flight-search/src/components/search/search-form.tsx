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
import type { FlightSearchInput, FlightSearchInputFlightClass } from "@workspace/api-client-react";

export type TripType = "oneway" | "roundtrip";

export interface SearchFormData {
  tripType: TripType;
  outbound: FlightSearchInput;
  returnFlight?: FlightSearchInput;
}

interface SearchFormProps {
  onSearch: (data: SearchFormData) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [tripType, setTripType] = useState<TripType>("oneway");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [adults, setAdults] = useState("1");
  const [flightClass, setFlightClass] = useState<FlightSearchInputFlightClass>("Econom");

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !departDate) return;
    if (tripType === "roundtrip" && !returnDate) return;

    const base = {
      origin,
      destination,
      adults: parseInt(adults, 10),
      flightClass,
    };

    onSearch({
      tripType,
      outbound: { ...base, date: format(departDate, "dd.MM.yyyy") },
      returnFlight:
        tripType === "roundtrip" && returnDate
          ? { ...base, origin: destination, destination: origin, date: format(returnDate, "dd.MM.yyyy") }
          : undefined,
    });
  };

  const isComplete =
    origin &&
    destination &&
    departDate &&
    (tripType === "oneway" || returnDate);

  return (
    <div className="w-full max-w-5xl mx-auto -mt-16 sm:-mt-24 relative z-10 px-4 sm:px-6">
      <div className="bg-card rounded-2xl shadow-xl border overflow-hidden">
        {/* Trip type tabs */}
        <div className="flex border-b">
          <button
            type="button"
            onClick={() => setTripType("oneway")}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors",
              tripType === "oneway"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            单程
          </button>
          <button
            type="button"
            onClick={() => setTripType("roundtrip")}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition-colors",
              tripType === "roundtrip"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            往返
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Locations */}
            <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-4 relative items-center">
              <LocationInput
                label="出发地"
                placeholder="出发城市或机场"
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
                label="目的地"
                placeholder="到达城市或机场"
                value={destination}
                onChange={setDestination}
              />
            </div>

            {/* Dates & Passengers */}
            <div className="flex flex-col sm:flex-row w-full gap-4">
              {/* Departure date */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  出发日期
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-14 justify-start text-left font-normal bg-background/50 hover:bg-background shadow-none text-base",
                        !departDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                      {departDate ? format(departDate, "PP") : <span>选择日期</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={departDate}
                      onSelect={(d) => {
                        setDepartDate(d);
                        if (returnDate && d && d >= returnDate) setReturnDate(undefined);
                      }}
                      initialFocus
                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Return date — only shown for round-trip */}
              {tripType === "roundtrip" && (
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    返回日期
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-14 justify-start text-left font-normal bg-background/50 hover:bg-background shadow-none text-base",
                          !returnDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground" />
                        {returnDate ? format(returnDate, "PP") : <span>选择日期</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        initialFocus
                        disabled={(d) =>
                          d < new Date(new Date().setHours(0, 0, 0, 0)) ||
                          (!!departDate && d <= departDate)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {/* Travelers & Class */}
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  乘客 & 舱位
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-14 justify-start text-left font-normal bg-background/50 hover:bg-background shadow-none text-base"
                    >
                      <Users className="mr-3 h-5 w-5 text-muted-foreground" />
                      <span className="truncate">
                        {adults} 位乘客, {flightClass === "Econom" ? "经济舱" : flightClass === "Business" ? "商务舱" : "头等舱"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">成人</p>
                          <p className="text-xs text-muted-foreground">12岁以上</p>
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
                          <p className="font-medium text-sm">舱位</p>
                        </div>
                        <Select value={flightClass} onValueChange={(val: FlightSearchInputFlightClass) => setFlightClass(val)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Econom">经济舱</SelectItem>
                            <SelectItem value="Business">商务舱</SelectItem>
                            <SelectItem value="First">头等舱</SelectItem>
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
              {isLoading ? "正在搜索..." : "搜索航班"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
