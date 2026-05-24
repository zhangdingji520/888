import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ALL_AIRPORTS,
  DOMESTIC,
  INTERNATIONAL,
  POPULAR_DOMESTIC_IATA,
  POPULAR_INTL_IATA,
  groupByFirstLetter,
  type AirportItem,
} from "@/data/airports";
import { useSearch } from "@/context/SearchContext";
import { useColors } from "@/hooks/useColors";

type TabType = "domestic" | "intl";

export default function CitySelectorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { field } = useLocalSearchParams<{ field: "origin" | "destination" }>();
  const { setOrigin, setDestination, addToHistory, history, origin, destination } = useSearch();

  const [tab, setTab] = useState<TabType>("domestic");
  const [query, setQuery] = useState("");
  const searchRef = useRef<TextInput>(null);
  const listRef = useRef<SectionList>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const currentIata = field === "origin" ? origin?.iata : destination?.iata;

  const handleSelect = useCallback((airport: AirportItem) => {
    addToHistory(airport);
    if (field === "origin") setOrigin(airport);
    else setDestination(airport);
    router.back();
  }, [field, setOrigin, setDestination, addToHistory, router]);

  const tabAirports = tab === "domestic" ? DOMESTIC : INTERNATIONAL;

  const popularIata = tab === "domestic" ? POPULAR_DOMESTIC_IATA : POPULAR_INTL_IATA;
  const popularAirports = useMemo(
    () => popularIata.map((iata) => tabAirports.find((a) => a.iata === iata)).filter(Boolean) as AirportItem[],
    [popularIata, tabAirports]
  );

  const grouped = useMemo(() => groupByFirstLetter(tabAirports), [tabAirports]);
  const letters = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const sections = useMemo(
    () => letters.map((letter) => ({ title: letter, data: grouped[letter] ?? [] })),
    [letters, grouped]
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toUpperCase();
    const ql = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_AIRPORTS.filter(
      (a) =>
        a.iata.includes(q) ||
        a.city.toLowerCase().includes(ql) ||
        a.name.toLowerCase().includes(ql) ||
        a.country.toLowerCase().includes(ql)
    ).slice(0, 20);
  }, [query]);

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    header: { backgroundColor: colors.primary, paddingTop: topPad },
    headerInner: {
      flexDirection: "row", alignItems: "center",
      gap: 10, padding: 12,
    },
    cancelBtn: {
      paddingHorizontal: 4, paddingVertical: 6,
    },
    cancelText: {
      color: "rgba(255,255,255,0.9)", fontSize: 15,
      fontFamily: "PlusJakartaSans_500Medium",
    },
    searchBox: {
      flex: 1, flexDirection: "row", alignItems: "center",
      backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 10,
      paddingVertical: 8, gap: 6,
    },
    searchInput: {
      flex: 1, fontSize: 15, color: colors.foreground,
      fontFamily: "PlusJakartaSans_400Regular",
      paddingVertical: 0,
    },
    tabs: { flexDirection: "row" },
    tabBtn: {
      flex: 1, paddingVertical: 10, alignItems: "center",
      borderBottomWidth: 2, borderBottomColor: "transparent",
    },
    tabBtnActive: { borderBottomColor: "#fff" },
    tabText: {
      fontSize: 14, fontWeight: "500" as const, color: "rgba(255,255,255,0.7)",
      fontFamily: "PlusJakartaSans_500Medium",
    },
    tabTextActive: { color: "#fff", fontWeight: "700" as const, fontFamily: "PlusJakartaSans_700Bold" },
    body: { flex: 1, flexDirection: "row" },
    listArea: { flex: 1 },
    sectionHeader: {
      paddingHorizontal: 16, paddingVertical: 6,
      backgroundColor: colors.muted,
    },
    sectionHeaderText: {
      fontSize: 12, fontWeight: "700" as const, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    airportRow: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: colors.border + "80",
      gap: 12,
    },
    airportRowSelected: { backgroundColor: colors.primary + "08" },
    airportCity: {
      fontSize: 15, fontWeight: "600" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    airportCitySelected: { color: colors.primary },
    airportIata: {
      fontSize: 12, color: colors.mutedForeground, fontFamily: "PlusJakartaSans_500Medium",
      marginLeft: 6,
    },
    airportName: {
      fontSize: 12, color: colors.mutedForeground, marginTop: 1,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    letterIndex: {
      width: 20, paddingVertical: 8,
      backgroundColor: colors.background,
      borderLeftWidth: 1, borderLeftColor: colors.border,
      alignItems: "center",
    },
    letterBtn: {
      width: 20, height: 18, alignItems: "center", justifyContent: "center",
    },
    letterText: {
      fontSize: 10, fontWeight: "600" as const, color: colors.primary,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    popularSection: { padding: 14 },
    popularTitle: {
      fontSize: 13, fontWeight: "700" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold", marginBottom: 10,
    },
    popularGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    cityChip: {
      paddingHorizontal: 12, paddingVertical: 7,
      borderRadius: 20, borderWidth: 1.5, borderColor: colors.border,
    },
    cityChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    cityChipText: {
      fontSize: 13, fontWeight: "500" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_500Medium",
    },
    cityChipTextSelected: { color: "#fff" },
    historySection: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6 },
    historyTitle: {
      fontSize: 13, fontWeight: "700" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold", marginBottom: 8,
    },
    historyRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    empty: { padding: 32, alignItems: "center" },
    emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "PlusJakartaSans_400Regular" },
  });

  function AirportRow({ airport }: { airport: AirportItem }) {
    const isSelected = airport.iata === currentIata;
    return (
      <Pressable
        style={[s.airportRow, isSelected && s.airportRowSelected]}
        onPress={() => handleSelect(airport)}
      >
        <Ionicons
          name="location"
          size={16}
          color={isSelected ? colors.primary : colors.mutedForeground}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={[s.airportCity, isSelected && s.airportCitySelected]}>{airport.city}</Text>
            <Text style={s.airportIata}>{airport.iata}</Text>
          </View>
          <Text style={s.airportName} numberOfLines={1}>{airport.name}</Text>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={18} color={colors.primary} />}
      </Pressable>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.headerInner}>
          <Pressable style={s.cancelBtn} onPress={() => router.back()}>
            <Text style={s.cancelText}>取消</Text>
          </Pressable>
          <View style={s.searchBox}>
            <Ionicons name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              ref={searchRef}
              style={s.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="搜索城市或机场..."
              placeholderTextColor={colors.mutedForeground}
              autoFocus
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")}>
                <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
              </Pressable>
            )}
          </View>
        </View>

        {!query && (
          <View style={s.tabs}>
            <Pressable style={[s.tabBtn, tab === "domestic" && s.tabBtnActive]} onPress={() => setTab("domestic")}>
              <Text style={[s.tabText, tab === "domestic" && s.tabTextActive]}>国内</Text>
            </Pressable>
            <Pressable style={[s.tabBtn, tab === "intl" && s.tabBtnActive]} onPress={() => setTab("intl")}>
              <Text style={[s.tabText, tab === "intl" && s.tabTextActive]}>国际/港澳台</Text>
            </Pressable>
          </View>
        )}
      </View>

      {query ? (
        /* Search results */
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.iata}
          renderItem={({ item }) => <AirportRow airport={item} />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyText}>未找到相关城市或机场</Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <View style={s.body}>
          <SectionList
            ref={listRef}
            style={s.listArea}
            sections={sections}
            keyExtractor={(item) => item.iata}
            renderItem={({ item }) => <AirportRow airport={item} />}
            renderSectionHeader={({ section }) => (
              <View style={s.sectionHeader}>
                <Text style={s.sectionHeaderText}>{section.title}</Text>
              </View>
            )}
            ListHeaderComponent={
              <>
                {history.length > 0 && (
                  <View style={s.historySection}>
                    <Text style={s.historyTitle}>最近搜索</Text>
                    <View style={s.historyRow}>
                      {history.map((a) => (
                        <Pressable
                          key={a.iata}
                          style={[s.cityChip, a.iata === currentIata && s.cityChipSelected]}
                          onPress={() => handleSelect(a)}
                        >
                          <Text style={[s.cityChipText, a.iata === currentIata && s.cityChipTextSelected]}>
                            {a.city}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
                <View style={s.popularSection}>
                  <Text style={s.popularTitle}>热门城市</Text>
                  <View style={s.popularGrid}>
                    {popularAirports.map((a) => (
                      <Pressable
                        key={a.iata}
                        style={[s.cityChip, a.iata === currentIata && s.cityChipSelected]}
                        onPress={() => handleSelect(a)}
                      >
                        <Text style={[s.cityChipText, a.iata === currentIata && s.cityChipTextSelected]}>
                          {a.city}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: 16, marginTop: 4 }} />
              </>
            }
            stickySectionHeadersEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          {/* Letter index sidebar */}
          <View style={s.letterIndex}>
            {letters.map((letter) => (
              <TouchableOpacity
                key={letter}
                style={s.letterBtn}
                onPress={() => {
                  const idx = sections.findIndex((s) => s.title === letter);
                  if (idx >= 0) {
                    listRef.current?.scrollToLocation({
                      sectionIndex: idx, itemIndex: 0,
                      animated: true, viewOffset: 0,
                    });
                  }
                }}
              >
                <Text style={s.letterText}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
