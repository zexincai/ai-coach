import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ImprovementSuggestion } from "../../types/models";

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  check_circle: "checkmark-circle",
  do_not_disturb_on: "notifications-off",
  split_scene: "git-branch-outline",
  schedule: "time-outline",
  psychology: "bulb",
  trending_up: "trending-up",
};

export function ImprovementTipItem({ suggestion }: { suggestion: ImprovementSuggestion }) {
  const icon = iconMap[suggestion.icon] || "checkmark-circle";

  return (
    <View
      className="p-md rounded-lg flex-row items-start gap-md"
      style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
    >
      <Ionicons name={icon} size={20} color="#fff" style={{ marginTop: 2 }} />
      <View className="flex-1">
        <Text className="text-label-md text-white font-bold mb-1">{suggestion.title}</Text>
        <Text className="text-body-md text-primary-fixed-dim">{suggestion.description}</Text>
      </View>
    </View>
  );
}
