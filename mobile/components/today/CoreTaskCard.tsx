import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../types/models";
import { PriorityBadge } from "../common/PriorityBadge";

interface CoreTaskCardProps {
  task: Task;
  onPress: () => void;
  onComplete: () => void;
}

export function CoreTaskCard({ task, onPress, onComplete }: CoreTaskCardProps) {
  return (
    <View
      className="bg-surface-container-lowest rounded-xl p-md flex-col justify-between flex-1"
      style={{
        borderWidth: 1,
        borderColor: "#e5e2e1",
        minHeight: 160,
        shadowColor: "rgba(0,61,155,0.04)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 3,
      }}
    >
      <View>
        <View className="flex-row justify-between items-start mb-sm">
          <PriorityBadge priority={task.priority} />
          {task.scheduled_time && (
            <View className="flex-row items-center gap-xs">
              <Ionicons name="time-outline" size={14} color="#434654" />
              <Text className="text-label-sm text-on-surface-variant">
                {task.scheduled_time}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-body-lg text-on-surface mb-xs" style={{ fontWeight: "600" }} numberOfLines={2}>
          {task.title}
        </Text>
        {task.description && (
          <Text className="text-body-md text-on-surface-variant" numberOfLines={2}>
            {task.description}
          </Text>
        )}
      </View>
      <View
        className="mt-md pt-md flex-row justify-between items-center"
        style={{
          borderTopWidth: 1,
          borderTopColor: "#e5e2e1",
        }}
      >
        {task.estimated_duration > 0 && (
          <View className="flex-row items-center gap-xs">
            <Ionicons name="time-outline" size={14} color="#003d9b" />
            <Text className="text-label-sm text-primary">{task.estimated_duration} 分钟</Text>
          </View>
        )}
        <View className="flex-row gap-sm">
          <TouchableOpacity
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: "#e8f5e9" }}
            onPress={onComplete}
          >
            <Ionicons name="checkmark" size={18} color="#2e7d32" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-8 h-8 rounded-full bg-secondary-container items-center justify-center"
            onPress={onPress}
          >
            <Ionicons name="arrow-forward" size={18} color="#003d9b" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
