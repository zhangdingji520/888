import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { SearchForm } from "@/components/search/search-form";
import { ResultsList } from "@/components/results/results-list";
import { useSearchFlights } from "@workspace/api-client-react";
import type { FlightSearchInput } from "@workspace/api-client-react/src/generated/api.schemas";
import heroImage from "@assets/hero.png";

export default function Home() {
  const [hasSearched, setHasSearched] = useState(false);
  
  const searchFlightsMutation = useSearchFlights();

  const handleSearch = (data: FlightSearchInput) => {
    setHasSearched(true);
    searchFlightsMutation.mutate({ data });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full h-[400px] md:h-[500px] bg-muted overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="/hero.png" 
              alt="SkySearch Hero" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center -mt-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
              Your Journey Begins Here
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl font-medium">
              Discover effortless flight booking. Fast, transparent, and designed for you.
            </p>
          </div>
        </section>

        {/* Search & Results */}
        <div className="flex-1 relative z-20">
          <SearchForm 
            onSearch={handleSearch} 
            isLoading={searchFlightsMutation.isPending} 
          />
          
          <ResultsList 
            isLoading={searchFlightsMutation.isPending}
            error={searchFlightsMutation.isError ? (searchFlightsMutation.error as any)?.error || "An error occurred" : null}
            result={searchFlightsMutation.data}
            hasSearched={hasSearched}
          />
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t bg-card py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl font-bold text-primary mb-2">SkySearch</p>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} SkySearch. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
