import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WeekPlan } from "../../types/models";

interface WeekHeaderProps {
  plan: WeekPlan;
  weekLabel: string;
  dateRange: string;
  onConfirm: () => void;
}

export function WeekHeader({ plan, weekLabel, dateRange, onConfirm }: WeekHeaderProps) {
  return (
    <View className="flex-col justify-between gap-md">
      <View className="flex-col gap-sm">
        <View className="flex-row items-center gap-sm">
          <Text className="text-headline-xl text-on-surface">{weekLabel}</Text>
          {plan.status === "draft" && (
            <View className="px-sm py-xs rounded-full bg-surface-container-high border border-outline-variant flex-row items-center gap-xs">
              <View className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              <Text className="text-label-sm text-on-surface-variant">待确认 (草稿)</Text>
            </View>
          )}
        </View>
        <Text className="text-body-md text-secondary">{dateRange}</Text>
      </View>
      {plan.status === "draft" && (
        <TouchableOpacity
          className="bg-primary h-11 px-lg rounded-xl flex-row items-center gap-xs"
          onPress={onConfirm}
          activeOpacity={0.9}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text className="text-label-md text-white">确认计划</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
