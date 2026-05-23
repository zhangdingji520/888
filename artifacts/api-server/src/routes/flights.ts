import { Router, type IRouter } from "express";
import { XMLParser } from "fast-xml-parser";
import {
  SearchFlightsBody,
  SearchFlightsResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SOAP_URL = "https://apisrv.city.travel/SiteCity";
const SOAP_ACTION = "http://tempuri.org/ISiteAvia/AeroSearch";
const API_LOGIN = "mobile";
const API_PASSWORD = "qwegerf4vr3";

function buildSoapEnvelope(input: {
  origin: string;
  destination: string;
  date: string;
  adults: number;
  children: number;
  infants: number;
  flightClass: string;
}): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope"
                   xmlns:ns1="http://schemas.datacontract.org/2004/07/SiteCity.Common"
                   xmlns:ns2="http://tempuri.org/"
                   xmlns:ns3="http://schemas.datacontract.org/2004/07/SiteCity.Avia.Search">
  <SOAP-ENV:Body>
    <ns2:AeroSearch>
      <ns2:credentials>
        <ns1:ApiLogin>${API_LOGIN}</ns1:ApiLogin>
        <ns1:ApiPassword>${API_PASSWORD}</ns1:ApiPassword>
        <ns1:Currency>EUR</ns1:Currency>
        <ns1:DeviceId>WEB-APP-001</ns1:DeviceId>
        <ns1:Language>EN</ns1:Language>
      </ns2:credentials>
      <ns2:aeroSearchParams>
        <ns3:Adults>${input.adults}</ns3:Adults>
        <ns3:Childs>${input.children}</ns3:Childs>
        <ns3:Infants>${input.infants}</ns3:Infants>
        <ns3:FlightClass>${input.flightClass}</ns3:FlightClass>
        <ns3:SearchFlights>
          <ns3:SearchFlight>
            <ns3:Date>${input.date}</ns3:Date>
            <ns3:IATAFrom>${input.origin}</ns3:IATAFrom>
            <ns3:IATATo>${input.destination}</ns3:IATATo>
          </ns3:SearchFlight>
        </ns3:SearchFlights>
      </ns2:aeroSearchParams>
    </ns2:AeroSearch>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function safeStr(val: unknown): string {
  if (val === undefined || val === null) return "";
  return String(val);
}

function safeNum(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSoapResponse(xmlText: string): any[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    isArray: (tagName) =>
      ["FlightData", "Variants", "FlightVariant", "Flights", "Flight"].includes(tagName),
  });

  const parsed = parser.parse(xmlText);

  const body =
    parsed?.["s:Envelope"]?.["s:Body"] ||
    parsed?.["SOAP-ENV:Envelope"]?.["SOAP-ENV:Body"] ||
    parsed?.Envelope?.Body ||
    {};

  const result =
    body?.AeroSearchResponse?.AeroSearchResult ||
    body?.["AeroSearchResponse"]?.["AeroSearchResult"] ||
    {};

  const flightDataList = result?.FlightData;
  if (!flightDataList || !Array.isArray(flightDataList)) return [];

  return flightDataList;
}

router.post("/flights/search", async (req, res): Promise<void> => {
  const parsed = SearchFlightsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    origin,
    destination,
    date,
    adults,
    children = 0,
    infants = 0,
    flightClass = "Econom",
  } = parsed.data;

  const soapBody = buildSoapEnvelope({
    origin,
    destination,
    date,
    adults,
    children,
    infants,
    flightClass,
  });

  let xmlText: string;
  try {
    const response = await fetch(SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": `application/soap+xml; charset=utf-8; action="${SOAP_ACTION}"`,
        "User-Agent": "FlightSearchApp/1.0",
        Accept: "*/*",
      },
      body: soapBody,
      signal: AbortSignal.timeout(25000),
    });

    if (!response.ok) {
      req.log.warn({ status: response.status }, "SOAP upstream error");
      res.status(502).json({ error: `Upstream service returned ${response.status}` });
      return;
    }

    xmlText = await response.text();
  } catch (err) {
    req.log.error({ err }, "Failed to reach SOAP service");
    res.status(502).json({ error: "Could not reach flight search service" });
    return;
  }

  let flightDataList: ReturnType<typeof parseSoapResponse>;
  try {
    flightDataList = parseSoapResponse(xmlText);
  } catch (err) {
    logger.warn({ err }, "Failed to parse SOAP XML response");
    res.status(502).json({ error: "Failed to parse flight data" });
    return;
  }

  // Transform SOAP data into our API schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const offers: any[] = [];

  for (const flightData of flightDataList) {
    const variants = flightData?.Variants?.FlightVariant;
    if (!variants || !Array.isArray(variants)) continue;

    for (const variant of variants) {
      const price = safeNum(variant?.Price?.Amount ?? variant?.TotalPrice);
      const currency = safeStr(variant?.Price?.Currency ?? variant?.Currency) || "EUR";

      const flights = variant?.Flights?.Flight;
      if (!flights || !Array.isArray(flights) || flights.length === 0) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const segments = flights.map((flight: any) => ({
        departureAirport: safeStr(flight?.IATAFrom ?? flight?.From),
        arrivalAirport: safeStr(flight?.IATATo ?? flight?.To),
        departureTime: safeStr(flight?.DepartureDate ?? flight?.Departure),
        arrivalTime: safeStr(flight?.ArrivalDate ?? flight?.Arrival),
        airline: safeStr(flight?.AirlineIATA ?? flight?.Airline),
        flightNumber: safeStr(flight?.FlightNumber ?? flight?.Number),
        duration: formatDuration(safeNum(flight?.FlightTime ?? flight?.Duration)),
      }));

      const stops = Math.max(0, segments.length - 1);
      const totalMinutes = flights.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, f: any) => sum + safeNum(f?.FlightTime ?? f?.Duration),
        0,
      );

      offers.push({
        id: safeStr(variant?.SearchId ?? variant?.Id) || `offer-${offers.length}`,
        price,
        currency,
        segments,
        stops,
        totalDuration: formatDuration(totalMinutes),
        airline: segments[0]?.airline || "",
        baggage: safeStr(variant?.Baggage) || null,
      });
    }
  }

  // Sort by price ascending
  offers.sort((a, b) => a.price - b.price);

  const searchId = `search-${Date.now()}`;

  const result = SearchFlightsResponse.parse({
    searchId,
    offers,
    totalCount: offers.length,
  });

  res.json(result);
});

export default router;
