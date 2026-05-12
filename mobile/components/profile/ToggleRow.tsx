import { View, Text, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ToggleRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onToggle: (val: boolean) => void;
}

export function ToggleRow({ icon, label, value, onToggle }: ToggleRowProps) {
  return (
    <View className="flex-row items-center justify-between p-md bg-surface-container-lowest border-b border-secondary-container/30">
      <View className="flex-row items-center gap-md">
        <View className="w-10 h-10 rounded-lg bg-surface-variant/50 items-center justify-center">
          <Ionicons name={icon} size={20} color="#555f6c" />
        </View>
        <Text className="text-body-md font-medium text-on-surface">{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#e5e2e1", true: "#0052cc" }}
        thumbColor="#fff"
      />
    </View>
  );
}
