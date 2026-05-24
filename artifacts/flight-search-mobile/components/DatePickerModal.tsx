import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

interface Props {
  visible: boolean;
  title: string;
  selected: Date | null;
  minDate?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export function DatePickerModal({ visible, title, selected, minDate, onSelect, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());

  const min = minDate ?? today;

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const s = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginTop: 12,
      marginBottom: 4,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    navBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    monthLabel: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    weekRow: {
      flexDirection: "row",
      paddingHorizontal: 12,
      paddingBottom: 8,
    },
    weekDay: {
      flex: 1,
      textAlign: "center",
      fontSize: 12,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 12,
    },
    cell: {
      width: "14.285714%",
      aspectRatio: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    dayText: {
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "PlusJakartaSans_500Medium",
    },
    selectedCircle: {
      backgroundColor: colors.primary,
      borderRadius: 100,
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    selectedText: {
      color: "#fff",
      fontWeight: "700" as const,
      fontFamily: "PlusJakartaSans_700Bold",
    },
    pastText: {
      color: colors.border,
    },
    todayDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
      position: "absolute",
      bottom: 2,
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={s.header}>
              <Text style={s.title}>{title}</Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </Pressable>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12 }}>
              <Pressable style={s.navBtn} onPress={prevMonth}>
                <Ionicons name="chevron-back" size={18} color={colors.foreground} />
              </Pressable>
              <Text style={s.monthLabel}>{viewYear}年{MONTHS[viewMonth]}</Text>
              <Pressable style={s.navBtn} onPress={nextMonth}>
                <Ionicons name="chevron-forward" size={18} color={colors.foreground} />
              </Pressable>
            </View>

            <View style={s.weekRow}>
              {WEEKDAYS.map((d) => (
                <Text key={d} style={s.weekDay}>{d}</Text>
              ))}
            </View>

            <View style={s.grid}>
              {cells.map((day, idx) => {
                if (!day) return <View key={`e-${idx}`} style={s.cell} />;
                const date = new Date(viewYear, viewMonth, day);
                date.setHours(0, 0, 0, 0);
                const isPast = date < min;
                const isSelected = selected !== null && date.getTime() === (selected instanceof Date ? selected.setHours(0,0,0,0) : 0);
                const isToday = date.getTime() === today.getTime();

                const selectedDate = selected ? new Date(selected) : null;
                if (selectedDate) selectedDate.setHours(0, 0, 0, 0);
                const isActuallySelected = selectedDate !== null && date.getTime() === selectedDate.getTime();

                return (
                  <Pressable
                    key={day}
                    style={s.cell}
                    disabled={isPast}
                    onPress={() => {
                      onSelect(new Date(viewYear, viewMonth, day));
                      onClose();
                    }}
                  >
                    <View style={isActuallySelected ? s.selectedCircle : undefined}>
                      <Text style={[s.dayText, isPast && s.pastText, isActuallySelected && s.selectedText]}>
                        {day}
                      </Text>
                    </View>
                    {isToday && !isActuallySelected && <View style={s.todayDot} />}
                  </Pressable>
                );
              })}
            </View>
            <View style={{ height: 8 }} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
