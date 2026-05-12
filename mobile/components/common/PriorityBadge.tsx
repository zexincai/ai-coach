import { View, Text } from "react-native";

const priorityConfig = {
  P0: { bg: "bg-error-container", text: "text-error" },
  P1: { bg: "bg-tertiary-container", text: "text-tertiary" },
  P2: { bg: "bg-surface-container-high", text: "text-secondary" },
};

export function PriorityBadge({ priority }: { priority: "P0" | "P1" | "P2" }) {
  const config = priorityConfig[priority];
  return (
    <View className={`px-2 py-0.5 rounded ${config.bg}`}>
      <Text className={`text-label-sm ${config.text}`}>{priority}</Text>
    </View>
  );
}
