import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { FlightOffer, FlightSegment } from "@workspace/api-client-react";
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
  if (m) return `${m[3]}年${parseInt(m[2], 10)}月${parseInt(m[1], 10)}日`;
  return raw.slice(0, 10);
}

function formatDuration(raw: string): string {
  if (!raw) return "";
  const h = raw.match(/(\d+)H/);
  const min = raw.match(/(\d+)M/);
  const hours = h ? `${h[1]}小时` : "";
  const mins = min ? `${min[1]}分钟` : "";
  return `${hours}${mins}` || raw;
}

const CLASS_LABELS: Record<string, string> = {
  Econom: "经济舱",
  Business: "商务舱",
  First: "头等舱",
};

function SegmentRow({ segment, colors, isLast }: {
  segment: FlightSegment;
  colors: ReturnType<typeof useColors>;
  isLast: boolean;
}) {
  const s = StyleSheet.create({
    wrapper: { paddingHorizontal: 16 },
    row: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    dotCol: { alignItems: "center", width: 20, paddingTop: 4 },
    dot: {
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.primary,
    },
    dotEmpty: {
      width: 10, height: 10, borderRadius: 5,
      borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.card,
    },
    line: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2 },
    content: { flex: 1, paddingBottom: 14 },
    timeRow: { flexDirection: "row", alignItems: "baseline", gap: 8, marginBottom: 2 },
    time: {
      fontSize: 20, fontWeight: "700" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    airport: {
      fontSize: 13, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    date: {
      fontSize: 11, color: colors.mutedForeground + "99",
      fontFamily: "PlusJakartaSans_400Regular", marginBottom: 8,
    },
    flightInfoBox: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.muted, borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 6, alignSelf: "flex-start",
      marginBottom: 2,
    },
    flightInfoText: {
      fontSize: 12, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_500Medium",
    },
    durationRow: {
      flexDirection: "row", alignItems: "center", gap: 6,
      marginBottom: 8,
    },
    durationText: {
      fontSize: 12, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_400Regular",
    },
  });

  return (
    <View style={s.wrapper}>
      <View style={s.row}>
        <View style={s.dotCol}>
          <View style={s.dot} />
          <View style={s.line} />
        </View>
        <View style={s.content}>
          <View style={s.timeRow}>
            <Text style={s.time}>{parseTime(segment.departureTime)}</Text>
            <Text style={s.airport}>{segment.departureAirport}</Text>
          </View>
          <Text style={s.date}>{parseDate(segment.departureTime)}</Text>
          <View style={s.flightInfoBox}>
            <Ionicons name="airplane-outline" size={12} color={colors.mutedForeground} />
            <Text style={s.flightInfoText}>{segment.airline} · {segment.flightNumber}</Text>
          </View>
          <View style={s.durationRow}>
            <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
            <Text style={s.durationText}>飞行时长 {formatDuration(segment.duration)}</Text>
          </View>
        </View>
      </View>

      {isLast && (
        <View style={s.row}>
          <View style={s.dotCol}>
            <View style={s.dotEmpty} />
          </View>
          <View style={[s.content, { paddingBottom: 0 }]}>
            <View style={s.timeRow}>
              <Text style={s.time}>{parseTime(segment.arrivalTime)}</Text>
              <Text style={s.airport}>{segment.arrivalAirport}</Text>
            </View>
            <Text style={s.date}>{parseDate(segment.arrivalTime)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

export default function BookingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    offerJson: string;
    flightClass: string;
    adults: string;
    label: string;
  }>();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  const offer: FlightOffer | null = useMemo(() => {
    try {
      return JSON.parse(params.offerJson ?? "null");
    } catch {
      return null;
    }
  }, [params.offerJson]);

  const adults = parseInt(params.adults ?? "1", 10);
  const classLabel = CLASS_LABELS[params.flightClass ?? "Econom"] ?? "经济舱";

  const taxes = offer ? Math.round(offer.price * 0.1) : 0;
  const baseFare = offer ? Math.round(offer.price - taxes) : 0;

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
    headerTitle: {
      fontSize: 18, fontWeight: "700" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold", flex: 1,
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: colors.radius + 2,
      borderWidth: 1,
      borderColor: colors.border,
      marginHorizontal: 16, marginBottom: 12,
      overflow: "hidden",
    },
    sectionHeader: {
      flexDirection: "row", alignItems: "center", gap: 8,
      paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    sectionTitle: {
      fontSize: 13, fontWeight: "700" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
      textTransform: "uppercase", letterSpacing: 0.5,
    },
    segmentsBody: { paddingTop: 14, paddingBottom: 4 },
    chip: {
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: colors.muted, borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 6,
      marginHorizontal: 16, marginBottom: 14, alignSelf: "flex-start",
    },
    chipText: {
      fontSize: 12, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_500Medium",
    },
    priceRow: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16, paddingVertical: 12,
    },
    priceDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: 16 },
    priceLabel: {
      fontSize: 14, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    priceValue: {
      fontSize: 14, color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    priceTotalLabel: {
      fontSize: 15, fontWeight: "700" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    priceTotalValue: {
      fontSize: 20, fontWeight: "800" as const, color: colors.primary,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    infoRow: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingHorizontal: 16, paddingVertical: 12,
    },
    infoText: {
      fontSize: 14, color: colors.foreground,
      fontFamily: "PlusJakartaSans_500Medium",
    },
    infoSub: {
      fontSize: 12, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_400Regular", marginTop: 1,
    },
    footer: {
      paddingHorizontal: 16, paddingTop: 12,
      paddingBottom: bottomPad,
      backgroundColor: colors.card,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    confirmBtn: {
      backgroundColor: colors.primary, borderRadius: colors.radius + 4,
      paddingVertical: 16, alignItems: "center",
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    },
    confirmText: {
      fontSize: 17, fontWeight: "700" as const, color: "#fff",
      fontFamily: "PlusJakartaSans_700Bold", letterSpacing: 0.3,
    },
    note: {
      fontSize: 11, color: colors.mutedForeground, textAlign: "center",
      fontFamily: "PlusJakartaSans_400Regular", marginTop: 8,
    },
    errorWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
    errorText: { fontSize: 16, color: colors.mutedForeground, fontFamily: "PlusJakartaSans_400Regular" },
  });

  if (!offer) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <View style={s.headerInner}>
            <Pressable style={s.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </Pressable>
            <Text style={s.headerTitle}>航班详情</Text>
          </View>
        </View>
        <View style={s.errorWrap}>
          <Ionicons name="warning-outline" size={48} color={colors.mutedForeground} />
          <Text style={s.errorText}>无法加载航班信息</Text>
        </View>
      </View>
    );
  }

  const firstSeg = offer.segments[0];
  const lastSeg = offer.segments[offer.segments.length - 1];
  const bookingRef = Math.random().toString(36).slice(2, 10).toUpperCase();

  function handleConfirm() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({
      pathname: "/confirmation",
      params: {
        bookingRef,
        origin: firstSeg.departureAirport,
        destination: lastSeg.arrivalAirport,
        airline: offer.airline || firstSeg.airline,
        flightNumber: firstSeg.flightNumber,
        departureTime: firstSeg.departureTime,
        arrivalTime: lastSeg.arrivalTime,
        totalPrice: String(Math.round(offer.price)),
        currency: offer.currency,
        label: params.label ?? "",
      },
    });
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.headerInner}>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </Pressable>
          <Text style={s.headerTitle}>{params.label ?? "航班详情"}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 8 }}>
        {/* Segments */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="airplane" size={14} color={colors.primary} />
            <Text style={s.sectionTitle}>航段信息</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "PlusJakartaSans_400Regular", marginLeft: "auto" }}>
              {offer.stops === 0 ? "直飞" : `${offer.stops}经停`} · {formatDuration(offer.totalDuration)}
            </Text>
          </View>
          <View style={s.segmentsBody}>
            {offer.segments.map((seg, i) => (
              <SegmentRow
                key={i}
                segment={seg}
                colors={colors}
                isLast={i === offer.segments.length - 1}
              />
            ))}
          </View>
          {offer.baggage && (
            <View style={s.chip}>
              <Ionicons name="briefcase-outline" size={12} color={colors.mutedForeground} />
              <Text style={s.chipText}>含托运行李 {offer.baggage}</Text>
            </View>
          )}
        </View>

        {/* Passenger info */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="people" size={14} color={colors.primary} />
            <Text style={s.sectionTitle}>乘客信息</Text>
          </View>
          <View style={s.infoRow}>
            <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
            <View>
              <Text style={s.infoText}>{adults} 位成人</Text>
              <Text style={s.infoSub}>{classLabel}</Text>
            </View>
          </View>
        </View>

        {/* Price breakdown */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Ionicons name="receipt-outline" size={14} color={colors.primary} />
            <Text style={s.sectionTitle}>价格明细</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>基础票价 × {adults}</Text>
            <Text style={s.priceValue}>¥{baseFare.toLocaleString("zh-CN")}</Text>
          </View>
          <View style={s.priceDivider} />
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>税费及附加费</Text>
            <Text style={s.priceValue}>¥{taxes.toLocaleString("zh-CN")}</Text>
          </View>
          <View style={s.priceDivider} />
          <View style={s.priceRow}>
            <Text style={s.priceTotalLabel}>总计</Text>
            <Text style={s.priceTotalValue}>¥{Math.round(offer.price).toLocaleString("zh-CN")}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Pressable style={s.confirmBtn} onPress={handleConfirm}>
          <Text style={s.confirmText}>确认预订</Text>
        </Pressable>
        <Text style={s.note}>点击确认即视为同意相关服务条款及隐私政策</Text>
      </View>
    </View>
  );
}
