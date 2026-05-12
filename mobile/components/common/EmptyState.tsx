import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  text: string;
  onPress?: () => void;
  height?: number;
}

export function EmptyState({ icon = "add", text, onPress, height = 100 }: EmptyStateProps) {
  return (
    <TouchableOpacity
      className="border-2 border-dashed border-surface-variant bg-surface-container-low rounded-xl items-center justify-center"
      style={{ height }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color="#737685" />
      <Text className="text-label-md text-outline mt-sm">{text}</Text>
    </TouchableOpacity>
  );
}
