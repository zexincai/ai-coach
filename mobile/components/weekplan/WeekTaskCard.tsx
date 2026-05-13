import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../types/models";
import { PriorityBadge } from "../common/PriorityBadge";

interface WeekTaskCardProps {
  task: Task;
}

const priorityAccentColor: Record<string, string> = {
  P0: "#ba1a1a",
  P1: "#0052cc",
  P2: "#555f6c",
};

export function WeekTaskCard({ task }: WeekTaskCardProps) {
  const accent = priorityAccentColor[task.priority];

  return (
    <View
      className="bg-surface-container-lowest rounded-xl p-md relative overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: "rgba(195,198,214,0.5)",
        shadowColor: "rgba(0,0,0,0.05)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accent }} />
      <View className="flex-col gap-xs ml-xs">
        <View className="flex-row items-center justify-between">
          <PriorityBadge priority={task.priority} />
        </View>
        <Text className="text-label-md text-on-surface mt-xs font-medium" numberOfLines={1}>
          {task.title}
        </Text>
        {task.scheduled_time && (
          <View className="flex-row items-center gap-xs mt-xs">
            <Ionicons name="time-outline" size={12} color="#555f6c" />
            <Text className="text-label-sm text-secondary">{task.scheduled_time}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
