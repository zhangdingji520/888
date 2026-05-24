import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useSearchFlights,
  type FlightOffer,
  type FlightSearchResult,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function parseTime(raw: string): string {
  if (!raw) return "--:--";
  const m = raw.match(/\d{2}\.\d{2}\.\d{4}\s+(\d{2}:\d{2})/);
  if (m) return m[1];
  return raw.slice(11, 16) || raw;
}

function parseDate(raw: string): string {
  if (!raw) return "";
  const m = raw.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (m) return `${parseInt(m[2], 10)}月${parseInt(m[1], 10)}日`;
  return "";
}

function FlightCard({ offer, colors }: { offer: FlightOffer; colors: ReturnType<typeof useColors> }) {
  const main = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];
  const isOvernight = main.departureTime.slice(0, 10) !== last.arrivalTime.slice(0, 10);

  const s = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius + 2,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: 16,
      marginBottom: 10,
      padding: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    topRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    airlineBadge: {
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: colors.primary + "15",
      alignItems: "center", justifyContent: "center", marginRight: 10,
    },
    airlineLetter: {
      fontSize: 16, fontWeight: "700" as const, color: colors.primary,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    airlineName: {
      fontSize: 13, fontWeight: "600" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold", flex: 1,
    },
    flightNo: {
      fontSize: 11, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_400Regular", marginTop: 1,
    },
    priceRow: { alignItems: "flex-end" },
    price: {
      fontSize: 22, fontWeight: "800" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold", lineHeight: 26,
    },
    priceSub: {
      fontSize: 11, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    timeline: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    timeBlock: { alignItems: "center", flex: 1 },
    timeText: {
      fontSize: 22, fontWeight: "700" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold", lineHeight: 26,
    },
    iataText: {
      fontSize: 13, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_500Medium", marginTop: 2,
    },
    dateText: {
      fontSize: 11, color: colors.mutedForeground + "99",
      fontFamily: "PlusJakartaSans_400Regular",
    },
    centerBlock: { flex: 1.5, alignItems: "center", paddingHorizontal: 4 },
    duration: {
      fontSize: 11, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_500Medium", marginBottom: 4,
    },
    lineRow: { flexDirection: "row", alignItems: "center", width: "100%" },
    line: { flex: 1, height: 1, backgroundColor: colors.border },
    stops: {
      fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5,
      color: colors.mutedForeground, fontFamily: "PlusJakartaSans_600SemiBold",
      marginTop: 4,
    },
    overnight: {
      fontSize: 11, color: "#f59e0b", fontWeight: "600" as const,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    footer: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", marginTop: 4,
    },
    baggageTag: {
      flexDirection: "row", alignItems: "center", gap: 4,
      backgroundColor: colors.muted, paddingHorizontal: 8, paddingVertical: 4,
      borderRadius: 6,
    },
    baggageText: {
      fontSize: 11, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_500Medium",
    },
    selectBtn: {
      backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 8,
      borderRadius: colors.radius,
    },
    selectText: {
      fontSize: 13, fontWeight: "700" as const, color: "#fff",
      fontFamily: "PlusJakartaSans_700Bold",
    },
  });

  return (
    <View style={s.card}>
      <View style={s.topRow}>
        <View style={s.airlineBadge}>
          <Text style={s.airlineLetter}>{(offer.airline || main.airline).charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.airlineName} numberOfLines={1}>{offer.airline || main.airline}</Text>
          <Text style={s.flightNo}>{main.flightNumber}</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.price}>¥{Math.round(offer.price).toLocaleString("zh-CN")}</Text>
          <Text style={s.priceSub}>总价</Text>
        </View>
      </View>

      <View style={s.timeline}>
        <View style={[s.timeBlock, { alignItems: "flex-start" }]}>
          <Text style={s.timeText}>{parseTime(main.departureTime)}</Text>
          <Text style={s.iataText}>{main.departureAirport}</Text>
          <Text style={s.dateText}>{parseDate(main.departureTime)}</Text>
        </View>

        <View style={s.centerBlock}>
          <Text style={s.duration}>{offer.totalDuration}</Text>
          <View style={s.lineRow}>
            <View style={s.line} />
            <Ionicons name="airplane" size={14} color={colors.primary} style={{ marginHorizontal: 4 }} />
            <View style={s.line} />
          </View>
          <Text style={s.stops}>{offer.stops === 0 ? "直飞" : `${offer.stops}经停`}</Text>
        </View>

        <View style={[s.timeBlock, { alignItems: "flex-end" }]}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 2 }}>
            <Text style={s.timeText}>{parseTime(last.arrivalTime)}</Text>
            {isOvernight && <Text style={s.overnight}>+1</Text>}
          </View>
          <Text style={s.iataText}>{last.arrivalAirport}</Text>
          <Text style={s.dateText}>{parseDate(last.arrivalTime)}</Text>
        </View>
      </View>

      <View style={s.footer}>
        {offer.baggage ? (
          <View style={s.baggageTag}>
            <Ionicons name="briefcase-outline" size={12} color={colors.mutedForeground} />
            <Text style={s.baggageText}>{offer.baggage}</Text>
          </View>
        ) : <View />}
        <Pressable style={s.selectBtn}>
          <Text style={s.selectText}>选择</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ResultSection({
  label,
  result,
  colors,
}: {
  label: string;
  result: FlightSearchResult;
  colors: ReturnType<typeof useColors>;
}) {
  const s = StyleSheet.create({
    label: {
      fontSize: 14, fontWeight: "700" as const, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_700Bold",
      paddingHorizontal: 16, paddingVertical: 10,
    },
    countText: {
      fontSize: 22, fontWeight: "800" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
      paddingHorizontal: 16, marginBottom: 10,
    },
    empty: { padding: 32, alignItems: "center" },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "PlusJakartaSans_400Regular" },
  });

  return (
    <View>
      <Text style={s.label}>{label}</Text>
      <Text style={s.countText}>{result.totalCount ?? result.offers.length} 个航班</Text>
      {result.offers.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>未找到航班，请调整日期或机场</Text>
        </View>
      ) : (
        result.offers.map((offer) => (
          <FlightCard key={offer.id} offer={offer} colors={colors} />
        ))
      )}
    </View>
  );
}

export default function ResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    origin: string; destination: string;
    originCity: string; destCity: string;
    departDate: string; returnDate: string;
    adults: string; flightClass: string; tripType: string;
  }>();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const outbound = useSearchFlights();
  const returnFlight = useSearchFlights();
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (hasFiredRef.current) return;
    hasFiredRef.current = true;
    const base = {
      origin: params.origin,
      destination: params.destination,
      date: params.departDate,
      adults: parseInt(params.adults ?? "1", 10),
      flightClass: params.flightClass as "Econom" | "Business" | "First" | undefined,
    };
    outbound.mutate(base);
    if (params.tripType === "roundtrip" && params.returnDate) {
      returnFlight.mutate({
        ...base,
        origin: params.destination,
        destination: params.origin,
        date: params.returnDate,
      });
    }
  }, []);

  const isLoading = outbound.isPending || (params.tripType === "roundtrip" && returnFlight.isPending);
  const errorMsg = (outbound.error as Error | null)?.message ?? null;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerInner: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    },
    backBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center", justifyContent: "center",
    },
    route: { flex: 1 },
    routeText: {
      fontSize: 18, fontWeight: "700" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    routeSub: {
      fontSize: 13, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_400Regular", marginTop: 1,
    },
    loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
    loadingText: {
      fontSize: 16, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_500Medium",
    },
    error: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
    errorText: {
      fontSize: 16, color: colors.destructive, textAlign: "center",
      fontFamily: "PlusJakartaSans_500Medium",
    },
    retryBtn: {
      backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12,
      borderRadius: colors.radius,
    },
    retryText: { color: "#fff", fontWeight: "700" as const, fontFamily: "PlusJakartaSans_700Bold" },
    divider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16, marginVertical: 12 },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 16 },
    CLASS_LABELS: {},
  });

  const CLASS_LABELS: Record<string, string> = { Econom: "经济舱", Business: "商务舱", First: "头等舱" };
  const classSub = `${params.adults}人 · ${CLASS_LABELS[params.flightClass ?? "Econom"] ?? "经济舱"}`;

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.headerInner}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
          <View style={s.route}>
            <Text style={s.routeText}>{params.originCity} → {params.destCity}</Text>
            <Text style={s.routeSub}>{params.departDate} · {classSub}</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={s.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>正在搜索最优惠航班...</Text>
        </View>
      ) : errorMsg ? (
        <View style={s.error}>
          <Ionicons name="warning-outline" size={48} color={colors.destructive} />
          <Text style={s.errorText}>{errorMsg}</Text>
          <Pressable
            style={s.retryBtn}
            onPress={() => {
              hasFiredRef.current = false;
              outbound.reset();
              returnFlight.reset();
              const base = {
                origin: params.origin, destination: params.destination,
                date: params.departDate, adults: parseInt(params.adults ?? "1", 10),
                flightClass: params.flightClass as "Econom" | "Business" | "First" | undefined,
              };
              outbound.mutate(base);
            }}
          >
            <Text style={s.retryText}>重试</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={[1]}
          keyExtractor={() => "results"}
          renderItem={() => (
            <View>
              {outbound.data && (
                <ResultSection
                  label={params.tripType === "roundtrip" ? "去程航班" : "可选航班"}
                  result={outbound.data}
                  colors={colors}
                />
              )}
              {params.tripType === "roundtrip" && returnFlight.data && (
                <>
                  <View style={s.divider} />
                  <ResultSection label="返程航班" result={returnFlight.data} colors={colors} />
                </>
              )}
              <View style={s.bottomPad} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !outbound.data ? (
              <View style={{ padding: 32, alignItems: "center" }}>
                <Text style={{ color: colors.mutedForeground, fontFamily: "PlusJakartaSans_400Regular" }}>
                  暂无数据
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
