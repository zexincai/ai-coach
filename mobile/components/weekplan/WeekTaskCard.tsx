import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../types/models";
import { PriorityBadge } from "../common/PriorityBadge";

interface WeekTaskCardProps {
  task: Task;
}

const priorityAccentColor = {
  P0: "bg-[#ba1a1a]",
  P1: "bg-[#0052cc]",
  P2: "bg-[#555f6c]",
};

export function WeekTaskCard({ task }: WeekTaskCardProps) {
  const accent = priorityAccentColor[task.priority];

  return (
    <View className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/50 shadow-sm relative overflow-hidden">
      <View className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
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
