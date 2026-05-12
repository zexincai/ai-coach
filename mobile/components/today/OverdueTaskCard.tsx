import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../types/models";

export function OverdueTaskCard({ task }: { task: Task }) {
  return (
    <View className="bg-red-50 border border-red-200 rounded-xl p-md">
      <View className="flex-row items-start gap-sm">
        <Ionicons name="refresh" size={18} color="#ba1a1a" style={{ marginTop: 2 }} />
        <View className="flex-1">
          <Text className="text-body-md font-medium text-on-surface">{task.title}</Text>
          <View className="flex-row items-center gap-sm mt-xs">
            <View className="bg-[#ba1a1a] rounded-full px-2 py-0.5 flex-row items-center gap-xs">
              <Ionicons name="time-outline" size={10} color="#fff" />
              <Text className="text-label-sm text-white">
                延期 {task.roll_over_count} 天
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
