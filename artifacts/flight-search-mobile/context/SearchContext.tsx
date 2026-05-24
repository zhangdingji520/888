import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AirportItem } from "@/data/airports";

export type TripType = "oneway" | "roundtrip";
export type FlightClass = "Econom" | "Business" | "First";

interface SearchContextValue {
  origin: AirportItem | null;
  destination: AirportItem | null;
  setOrigin: (a: AirportItem | null) => void;
  setDestination: (a: AirportItem | null) => void;
  swapAirports: () => void;
  departDate: Date | null;
  returnDate: Date | null;
  setDepartDate: (d: Date | null) => void;
  setReturnDate: (d: Date | null) => void;
  adults: number;
  setAdults: (n: number) => void;
  flightClass: FlightClass;
  setFlightClass: (c: FlightClass) => void;
  tripType: TripType;
  setTripType: (t: TripType) => void;
  history: AirportItem[];
  addToHistory: (a: AirportItem) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

const HISTORY_KEY = "skysearch-history";
const MAX_HISTORY = 8;

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [origin, setOrigin] = useState<AirportItem | null>(null);
  const [destination, setDestination] = useState<AirportItem | null>(null);
  const [departDate, setDepartDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState<number>(1);
  const [flightClass, setFlightClass] = useState<FlightClass>("Econom");
  const [tripType, setTripType] = useState<TripType>("oneway");
  const [history, setHistory] = useState<AirportItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((val) => {
      if (val) {
        try {
          setHistory(JSON.parse(val));
        } catch {
          // ignore
        }
      }
    });
  }, []);

  const addToHistory = useCallback((airport: AirportItem) => {
    setHistory((prev) => {
      const next = [airport, ...prev.filter((a) => a.iata !== airport.iata)].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const swapAirports = useCallback(() => {
    setOrigin((prev) => {
      const prevOrigin = prev;
      setDestination(prevOrigin);
      return destination;
    });
  }, [destination]);

  return (
    <SearchContext.Provider
      value={{
        origin,
        destination,
        setOrigin,
        setDestination,
        swapAirports,
        departDate,
        returnDate,
        setDepartDate,
        setReturnDate,
        adults,
        setAdults,
        flightClass,
        setFlightClass,
        tripType,
        setTripType,
        history,
        addToHistory,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
