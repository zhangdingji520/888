import { AlertCircle, ArrowUpDown } from "lucide-react";
import { FlightCard } from "./flight-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { FlightSearchResult } from "@workspace/api-client-react/src/generated/api.schemas";

interface ResultsListProps {
  isLoading: boolean;
  error?: string | null;
  result?: FlightSearchResult;
  hasSearched: boolean;
}

export function ResultsList({ isLoading, error, result, hasSearched }: ResultsListProps) {
  if (!hasSearched && !isLoading && !error && !result) {
    return (
      <div className="py-24 text-center">
        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <Plane className="w-8 h-8 text-primary opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Where to next?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter your travel details above to discover the best flights tailored for you.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg">Search Failed</AlertTitle>
          <AlertDescription className="text-sm mt-1">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (result && result.offers.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">No flights found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn't find any flights matching your criteria. Try adjusting your dates or airports.
        </p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {result.totalCount || result.offers.length} flights available
          </h2>
          <p className="text-sm text-muted-foreground">Showing best results for your trip</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-background border rounded-lg hover:bg-muted transition-colors">
            <ArrowUpDown className="w-4 h-4" />
            Sort by: Recommended
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {result.offers.map((offer) => (
          <FlightCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}

// Inline Plane icon for the empty state
function Plane(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3 3-3-1-1 1 5 5 1-1-1-3 3-3 5 6l1.2-.7c.4-.2.7-.6.6-1.1Z" />
    </svg>
  );
}
