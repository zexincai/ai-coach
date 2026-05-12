import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function TopAppBar() {
  return (
    <View className="flex-row justify-between items-center px-margin-mobile py-sm bg-surface">
      <View className="flex-row items-center gap-sm">
        <View className="w-8 h-8 rounded-full bg-secondary-container items-center justify-center">
          <Ionicons name="person" size={18} color="#003d9b" />
        </View>
        <Text className="text-headline-md font-bold text-primary">Zenith Planner</Text>
      </View>
      <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
        <Ionicons name="hardware-chip-outline" size={22} color="#003d9b" />
      </TouchableOpacity>
    </View>
  );
}
