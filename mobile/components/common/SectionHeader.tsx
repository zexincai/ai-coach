import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SectionHeaderProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  color?: string;
  uppercase?: boolean;
}

export function SectionHeader({ icon, title, color = "#003d9b", uppercase }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center gap-xs mb-sm">
      <Ionicons name={icon} size={18} color={color} />
      <Text
        className="text-label-md text-on-surface-variant"
        style={uppercase ? { textTransform: "uppercase", letterSpacing: 1 } : undefined}
      >
        {title}
      </Text>
    </View>
  );
}
