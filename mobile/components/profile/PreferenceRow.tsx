import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PreferenceRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}

export function PreferenceRow({ icon, label, value, onPress }: PreferenceRowProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between p-md bg-surface-container-lowest border-b border-secondary-container/30"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-md">
        <View className="w-10 h-10 rounded-lg bg-primary-fixed/30 items-center justify-center">
          <Ionicons name={icon} size={20} color="#003d9b" />
        </View>
        <View>
          <Text className="text-body-md font-medium text-on-surface">{label}</Text>
          <Text className="text-label-sm text-secondary">{value}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#555f6c" />
    </TouchableOpacity>
  );
}
