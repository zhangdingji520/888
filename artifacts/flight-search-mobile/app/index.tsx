import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DatePickerModal } from "@/components/DatePickerModal";
import { PassengerModal } from "@/components/PassengerModal";
import { useSearch } from "@/context/SearchContext";
import { useColors } from "@/hooks/useColors";

function formatDateDisplay(date: Date): string {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${date.getMonth() + 1}月${date.getDate()}日 ${days[date.getDay()]}`;
}

function formatDateForAPI(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}.${date.getFullYear()}`;
}

const CLASS_LABELS: Record<string, string> = {
  Econom: "经济舱",
  Business: "商务舱",
  First: "头等舱",
};

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    origin, destination, swapAirports,
    departDate, returnDate, setDepartDate, setReturnDate,
    adults, setAdults, flightClass, setFlightClass,
    tripType, setTripType,
  } = useSearch();

  const [showDepartPicker, setShowDepartPicker] = useState(false);
  const [showReturnPicker, setShowReturnPicker] = useState(false);
  const [showPassengerModal, setShowPassengerModal] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const canSearch =
    origin !== null &&
    destination !== null &&
    departDate !== null &&
    (tripType === "oneway" || returnDate !== null);

  function handleSearch() {
    if (!canSearch || !origin || !destination || !departDate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/results",
      params: {
        origin: origin.iata,
        destination: destination.iata,
        originCity: origin.city,
        destCity: destination.city,
        departDate: formatDateForAPI(departDate),
        returnDate: returnDate ? formatDateForAPI(returnDate) : "",
        adults: String(adults),
        flightClass,
        tripType,
      },
    });
  }

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    hero: { paddingTop: topPad + 8, paddingBottom: 28, paddingHorizontal: 20 },
    heroRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    heroTitle: {
      fontSize: 28, fontWeight: "800" as const, color: "#fff",
      fontFamily: "PlusJakartaSans_700Bold", letterSpacing: -0.5,
    },
    heroSub: {
      fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    content: { padding: 16, gap: 12 },
    card: {
      backgroundColor: colors.card, borderRadius: colors.radius + 4,
      borderWidth: 1, borderColor: colors.border,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    },
    tripToggle: { flexDirection: "row", padding: 4, gap: 4 },
    tripBtn: {
      flex: 1, paddingVertical: 8, borderRadius: colors.radius,
      alignItems: "center",
    },
    tripBtnActive: { backgroundColor: colors.primary },
    tripBtnText: {
      fontSize: 14, fontWeight: "600" as const, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    tripBtnTextActive: { color: "#fff" },
    locationRow: {
      flexDirection: "row", alignItems: "stretch",
    },
    locationHalf: {
      flex: 1, padding: 16,
    },
    locationDivider: {
      width: 1, backgroundColor: colors.border, marginVertical: 12,
    },
    swapWrapper: {
      position: "absolute", right: -18, top: "50%",
      marginTop: -18, zIndex: 10,
    },
    swapBtn: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primary,
      alignItems: "center", justifyContent: "center",
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
    },
    fieldLabel: {
      fontSize: 11, fontWeight: "600" as const, color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 0.8,
      fontFamily: "PlusJakartaSans_600SemiBold", marginBottom: 4,
    },
    fieldCity: {
      fontSize: 20, fontWeight: "700" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    fieldCityPlaceholder: {
      fontSize: 16, fontWeight: "400" as const, color: colors.border,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    fieldIata: {
      fontSize: 13, color: colors.mutedForeground, marginTop: 2,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    dateRow: { flexDirection: "row" },
    dateHalf: {
      flex: 1, padding: 16,
    },
    dateDivider: {
      width: 1, backgroundColor: colors.border, marginVertical: 12,
    },
    dateValue: {
      fontSize: 15, fontWeight: "600" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold", marginTop: 4,
    },
    dateValuePlaceholder: {
      fontSize: 14, fontWeight: "400" as const, color: colors.border,
      fontFamily: "PlusJakartaSans_400Regular", marginTop: 4,
    },
    passengerRow: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", padding: 16,
    },
    passengerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    passengerLabel: {
      fontSize: 15, fontWeight: "600" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    passengerSub: {
      fontSize: 13, color: colors.mutedForeground, marginTop: 2,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    searchBtn: {
      backgroundColor: colors.primary, borderRadius: colors.radius + 4,
      paddingVertical: 16, alignItems: "center",
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
      marginTop: 4,
    },
    searchBtnDisabled: { opacity: 0.5 },
    searchBtnText: {
      fontSize: 17, fontWeight: "700" as const, color: "#fff",
      fontFamily: "PlusJakartaSans_700Bold", letterSpacing: 0.3,
    },
    iconBox: {
      width: 40, height: 40, borderRadius: 10,
      backgroundColor: colors.primary + "15",
      alignItems: "center", justifyContent: "center",
    },
    bottomPad: { height: Platform.OS === "web" ? 34 : insets.bottom + 16 },
  });

  return (
    <View style={s.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#2563eb", "#1d4ed8"]}
        style={s.hero}
      >
        <View style={s.heroRow}>
          <Ionicons name="airplane" size={28} color="#fff" />
          <Text style={s.heroTitle}>SkySearch</Text>
        </View>
        <Text style={s.heroSub}>搜索最优惠的机票</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Trip type toggle */}
        <View style={[s.card, { padding: 4 }]}>
          <View style={s.tripToggle}>
            <Pressable
              style={[s.tripBtn, tripType === "oneway" && s.tripBtnActive]}
              onPress={() => setTripType("oneway")}
            >
              <Text style={[s.tripBtnText, tripType === "oneway" && s.tripBtnTextActive]}>单程</Text>
            </Pressable>
            <Pressable
              style={[s.tripBtn, tripType === "roundtrip" && s.tripBtnActive]}
              onPress={() => setTripType("roundtrip")}
            >
              <Text style={[s.tripBtnText, tripType === "roundtrip" && s.tripBtnTextActive]}>往返</Text>
            </Pressable>
          </View>
        </View>

        {/* Origin / Destination */}
        <View style={[s.card, { overflow: "visible" }]}>
          <View style={s.locationRow}>
            <Pressable
              style={s.locationHalf}
              onPress={() => router.push({ pathname: "/city-selector", params: { field: "origin" } })}
            >
              <Text style={s.fieldLabel}>出发地</Text>
              {origin ? (
                <>
                  <Text style={s.fieldCity}>{origin.city}</Text>
                  <Text style={s.fieldIata}>{origin.iata} · {origin.name}</Text>
                </>
              ) : (
                <Text style={s.fieldCityPlaceholder}>出发城市</Text>
              )}
            </Pressable>

            <View style={s.locationDivider} />

            <View style={s.swapWrapper}>
              <Pressable
                style={s.swapBtn}
                onPress={() => { Haptics.selectionAsync(); swapAirports(); }}
              >
                <Ionicons name="swap-horizontal" size={16} color={colors.primary} />
              </Pressable>
            </View>

            <Pressable
              style={[s.locationHalf, { paddingLeft: 24 }]}
              onPress={() => router.push({ pathname: "/city-selector", params: { field: "destination" } })}
            >
              <Text style={s.fieldLabel}>目的地</Text>
              {destination ? (
                <>
                  <Text style={s.fieldCity}>{destination.city}</Text>
                  <Text style={s.fieldIata}>{destination.iata} · {destination.name}</Text>
                </>
              ) : (
                <Text style={s.fieldCityPlaceholder}>到达城市</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Dates */}
        <View style={s.card}>
          <View style={s.dateRow}>
            <Pressable style={s.dateHalf} onPress={() => setShowDepartPicker(true)}>
              <Text style={s.fieldLabel}>出发日期</Text>
              {departDate ? (
                <Text style={s.dateValue}>{formatDateDisplay(departDate)}</Text>
              ) : (
                <Text style={s.dateValuePlaceholder}>请选择日期</Text>
              )}
            </Pressable>

            {tripType === "roundtrip" && (
              <>
                <View style={s.dateDivider} />
                <Pressable style={s.dateHalf} onPress={() => setShowReturnPicker(true)}>
                  <Text style={s.fieldLabel}>返回日期</Text>
                  {returnDate ? (
                    <Text style={s.dateValue}>{formatDateDisplay(returnDate)}</Text>
                  ) : (
                    <Text style={s.dateValuePlaceholder}>请选择日期</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Passengers & class */}
        <Pressable style={s.card} onPress={() => setShowPassengerModal(true)}>
          <View style={s.passengerRow}>
            <View style={s.passengerLeft}>
              <View style={s.iconBox}>
                <Ionicons name="people" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={s.passengerLabel}>{adults} 位成人</Text>
                <Text style={s.passengerSub}>{CLASS_LABELS[flightClass]}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </View>
        </Pressable>

        {/* Search button */}
        <Pressable
          style={[s.searchBtn, !canSearch && s.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={!canSearch}
        >
          <Text style={s.searchBtnText}>搜索航班</Text>
        </Pressable>

        <View style={s.bottomPad} />
      </ScrollView>

      <DatePickerModal
        visible={showDepartPicker}
        title="出发日期"
        selected={departDate}
        onSelect={(d) => {
          setDepartDate(d);
          if (returnDate && d >= returnDate) setReturnDate(null);
        }}
        onClose={() => setShowDepartPicker(false)}
      />

      <DatePickerModal
        visible={showReturnPicker}
        title="返回日期"
        selected={returnDate}
        minDate={departDate ?? undefined}
        onSelect={setReturnDate}
        onClose={() => setShowReturnPicker(false)}
      />

      <PassengerModal
        visible={showPassengerModal}
        adults={adults}
        flightClass={flightClass}
        onChangeAdults={setAdults}
        onChangeClass={setFlightClass}
        onClose={() => setShowPassengerModal(false)}
      />
    </View>
  );
}
