import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { FlightClass } from "@/context/SearchContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  adults: number;
  flightClass: FlightClass;
  onChangeAdults: (n: number) => void;
  onChangeClass: (c: FlightClass) => void;
  onClose: () => void;
}

const CLASS_OPTIONS: { label: string; value: FlightClass }[] = [
  { label: "经济舱", value: "Econom" },
  { label: "商务舱", value: "Business" },
  { label: "头等舱", value: "First" },
];

export function PassengerModal({ visible, adults, flightClass, onChangeAdults, onChangeClass, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
    },
    handle: {
      width: 40, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 16,
    },
    header: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", marginBottom: 24,
    },
    title: {
      fontSize: 18, fontWeight: "700" as const,
      color: colors.foreground, fontFamily: "PlusJakartaSans_700Bold",
    },
    row: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between", marginBottom: 20,
    },
    label: { fontSize: 16, fontWeight: "600" as const, color: colors.foreground, fontFamily: "PlusJakartaSans_600SemiBold" },
    sublabel: { fontSize: 13, color: colors.mutedForeground, marginTop: 2, fontFamily: "PlusJakartaSans_400Regular" },
    counter: { flexDirection: "row", alignItems: "center", gap: 16 },
    countBtn: {
      width: 36, height: 36, borderRadius: 18,
      borderWidth: 1.5, borderColor: colors.border,
      alignItems: "center", justifyContent: "center",
    },
    countBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
    countText: { fontSize: 18, fontWeight: "700" as const, color: colors.foreground, fontFamily: "PlusJakartaSans_700Bold", minWidth: 24, textAlign: "center" },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 20 },
    classRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
    classBtn: {
      flex: 1, paddingVertical: 10, borderRadius: colors.radius,
      borderWidth: 1.5, borderColor: colors.border, alignItems: "center",
    },
    classBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + "10" },
    classBtnText: { fontSize: 13, fontWeight: "600" as const, color: colors.mutedForeground, fontFamily: "PlusJakartaSans_600SemiBold" },
    classBtnTextActive: { color: colors.primary },
    doneBtn: {
      backgroundColor: colors.primary, borderRadius: colors.radius,
      paddingVertical: 14, alignItems: "center",
    },
    doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" as const, fontFamily: "PlusJakartaSans_700Bold" },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={s.header}>
              <Text style={s.title}>乘客 & 舱位</Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <View style={s.row}>
              <View>
                <Text style={s.label}>成人</Text>
                <Text style={s.sublabel}>12岁以上</Text>
              </View>
              <View style={s.counter}>
                <Pressable
                  style={[s.countBtn, adults > 1 && s.countBtnActive]}
                  onPress={() => adults > 1 && onChangeAdults(adults - 1)}
                >
                  <Ionicons name="remove" size={18} color={adults > 1 ? colors.primary : colors.border} />
                </Pressable>
                <Text style={s.countText}>{adults}</Text>
                <Pressable
                  style={[s.countBtn, adults < 9 && s.countBtnActive]}
                  onPress={() => adults < 9 && onChangeAdults(adults + 1)}
                >
                  <Ionicons name="add" size={18} color={adults < 9 ? colors.primary : colors.border} />
                </Pressable>
              </View>
            </View>

            <View style={s.divider} />

            <Text style={[s.label, { marginBottom: 12 }]}>舱位</Text>
            <View style={s.classRow}>
              {CLASS_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[s.classBtn, flightClass === opt.value && s.classBtnActive]}
                  onPress={() => onChangeClass(opt.value)}
                >
                  <Text style={[s.classBtnText, flightClass === opt.value && s.classBtnTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={s.doneBtn} onPress={onClose}>
              <Text style={s.doneBtnText}>确认</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
