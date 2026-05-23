import { Clock, Plane, Briefcase } from "lucide-react";
import type { FlightOffer } from "@workspace/api-client-react/src/generated/api.schemas";

interface FlightCardProps {
  offer: FlightOffer;
}

function formatDuration(durationStr: string) {
  // ISO 8601 duration parse approx: PT2H30M -> 2h 30m
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return durationStr;
  const h = match[1] ? `${match[1]}h` : '';
  const m = match[2] ? `${match[2]}m` : '';
  return `${h} ${m}`.trim() || 'Unknown';
}

function formatTime(isoString: string) {
  if (!isoString) return "";
  try {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(new Date(isoString));
  } catch (e) {
    return isoString;
  }
}

export function FlightCard({ offer }: FlightCardProps) {
  const mainSegment = offer.segments[0];
  const lastSegment = offer.segments[offer.segments.length - 1];

  return (
    <div className="group bg-card border rounded-xl p-5 sm:p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200">
      <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
        
        {/* Airline Info & Times */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          
          {/* Airline Logo/Name placeholder */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {offer.airline?.charAt(0) || mainSegment.airline.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">{offer.airline || mainSegment.airline}</p>
              <p className="text-xs text-muted-foreground">Flight {mainSegment.flightNumber}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="col-span-2 flex items-center gap-4 justify-between sm:justify-center w-full">
            <div className="text-right flex-1">
              <p className="text-xl font-bold text-foreground">{formatTime(mainSegment.departureTime)}</p>
              <p className="text-sm text-muted-foreground font-medium">{mainSegment.departureAirport}</p>
            </div>

            <div className="flex flex-col items-center justify-center flex-[1.5] px-2">
              <p className="text-xs text-muted-foreground mb-1 font-medium">{formatDuration(offer.totalDuration)}</p>
              <div className="w-full flex items-center gap-2">
                <div className="h-px bg-border flex-1 relative">
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-muted-foreground/50 -left-0.5 -top-[2px]" />
                </div>
                <Plane className="w-4 h-4 text-primary shrink-0" />
                <div className="h-px bg-border flex-1 relative">
                  <div className="absolute w-1.5 h-1.5 rounded-full bg-muted-foreground/50 -right-0.5 -top-[2px]" />
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-1">
                {offer.stops === 0 ? "Direct" : `${offer.stops} Stop${offer.stops > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="text-left flex-1">
              <p className="text-xl font-bold text-foreground">{formatTime(lastSegment.arrivalTime)}</p>
              <p className="text-sm text-muted-foreground font-medium">{lastSegment.arrivalAirport}</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px h-16 bg-border mx-2" />

        {/* Pricing & CTA */}
        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 lg:w-48 shrink-0">
          <div className="flex flex-col items-start lg:items-end">
            <p className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: offer.currency || 'USD' }).format(offer.price)}
            </p>
            <p className="text-xs text-muted-foreground">Total price for all travelers</p>
            
            {offer.baggage && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                <Briefcase className="w-3.5 h-3.5" />
                <span>{offer.baggage}</span>
              </div>
            )}
          </div>
          <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm active:scale-[0.98]">
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
