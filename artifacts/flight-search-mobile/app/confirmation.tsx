import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

export default function ConfirmationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingRef: string;
    origin: string;
    destination: string;
    airline: string;
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    totalPrice: string;
    currency: string;
    label: string;
  }>();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom + 16;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      flexGrow: 1, alignItems: "center",
      paddingTop: topPad + 20, paddingHorizontal: 24, paddingBottom: 24,
    },
    successCircle: {
      width: 88, height: 88, borderRadius: 44,
      backgroundColor: "#16a34a15",
      alignItems: "center", justifyContent: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 26, fontWeight: "800" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_700Bold", textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14, color: colors.mutedForeground, textAlign: "center",
      fontFamily: "PlusJakartaSans_400Regular", lineHeight: 20,
      marginBottom: 28,
    },
    refCard: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: colors.radius + 4,
      borderWidth: 1, borderColor: colors.border,
      padding: 20, alignItems: "center",
      marginBottom: 16,
    },
    refLabel: {
      fontSize: 11, fontWeight: "600" as const, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_600SemiBold",
      textTransform: "uppercase", letterSpacing: 1, marginBottom: 6,
    },
    refCode: {
      fontSize: 28, fontWeight: "800" as const, color: colors.primary,
      fontFamily: "PlusJakartaSans_700Bold", letterSpacing: 4,
    },
    detailCard: {
      width: "100%",
      backgroundColor: colors.card,
      borderRadius: colors.radius + 4,
      borderWidth: 1, borderColor: colors.border,
      overflow: "hidden", marginBottom: 16,
    },
    detailRow: {
      flexDirection: "row", alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16, paddingVertical: 13,
    },
    detailDivider: { height: 1, backgroundColor: colors.border },
    detailLabel: {
      fontSize: 13, color: colors.mutedForeground,
      fontFamily: "PlusJakartaSans_400Regular",
    },
    detailValue: {
      fontSize: 14, color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold", textAlign: "right", flex: 1, marginLeft: 16,
    },
    totalValue: {
      fontSize: 16, fontWeight: "800" as const, color: colors.primary,
      fontFamily: "PlusJakartaSans_700Bold", textAlign: "right", flex: 1, marginLeft: 16,
    },
    noticeBox: {
      width: "100%",
      flexDirection: "row", alignItems: "flex-start", gap: 10,
      backgroundColor: "#2563eb10",
      borderRadius: colors.radius + 2, padding: 14,
      marginBottom: 24,
    },
    noticeText: {
      fontSize: 12, color: colors.mutedForeground, lineHeight: 18,
      fontFamily: "PlusJakartaSans_400Regular", flex: 1,
    },
    footer: {
      width: "100%", gap: 10, marginTop: "auto", paddingBottom: bottomPad - 24,
    },
    homeBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius + 4, paddingVertical: 15,
      alignItems: "center",
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    homeBtnText: {
      fontSize: 16, fontWeight: "700" as const, color: "#fff",
      fontFamily: "PlusJakartaSans_700Bold",
    },
    newSearchBtn: {
      backgroundColor: colors.muted,
      borderRadius: colors.radius + 4, paddingVertical: 14,
      alignItems: "center",
    },
    newSearchText: {
      fontSize: 16, fontWeight: "600" as const, color: colors.foreground,
      fontFamily: "PlusJakartaSans_600SemiBold",
    },
  });

  return (
    <View style={s.root}>
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={[s.scrollContent, { width: "100%" }]}>
          <View style={s.successCircle}>
            <Ionicons name="checkmark-circle" size={52} color="#16a34a" />
          </View>

          <Text style={s.title}>预订成功！</Text>
          <Text style={s.subtitle}>
            您的航班已成功预订。{"\n"}请保存好以下预订参考号。
          </Text>

          <View style={s.refCard}>
            <Text style={s.refLabel}>预订参考号</Text>
            <Text style={s.refCode}>{params.bookingRef}</Text>
          </View>

          <View style={s.detailCard}>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>航线</Text>
              <Text style={s.detailValue}>{params.origin} → {params.destination}</Text>
            </View>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>航班</Text>
              <Text style={s.detailValue}>{params.airline} {params.flightNumber}</Text>
            </View>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>出发</Text>
              <Text style={s.detailValue}>
                {parseDate(params.departureTime)} {parseTime(params.departureTime)}
              </Text>
            </View>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>到达</Text>
              <Text style={s.detailValue}>
                {parseDate(params.arrivalTime)} {parseTime(params.arrivalTime)}
              </Text>
            </View>
            <View style={s.detailDivider} />
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>总价</Text>
              <Text style={s.totalValue}>
                ¥{parseInt(params.totalPrice ?? "0", 10).toLocaleString("zh-CN")}
              </Text>
            </View>
          </View>

          <View style={s.noticeBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={s.noticeText}>
              请在出发前24小时确认您的航班状态。电子机票将发送至您的注册邮箱。
            </Text>
          </View>

          <View style={s.footer}>
            <Pressable
              style={s.homeBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.dismissAll();
              }}
            >
              <Text style={s.homeBtnText}>返回主页</Text>
            </Pressable>
            <Pressable
              style={s.newSearchBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.dismissAll();
              }}
            >
              <Text style={s.newSearchText}>搜索更多航班</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
