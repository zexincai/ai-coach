import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Task } from "../../types/models";

interface RemainingTaskItemProps {
  task: Task;
  onToggle: () => void;
}

export function RemainingTaskItem({ task, onToggle }: RemainingTaskItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-sm p-sm rounded-lg"
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View className="w-5 h-5 rounded border-2 border-outline-variant items-center justify-center">
        {/* Empty checkbox */}
      </View>
      <Text className="text-body-md text-on-surface flex-1">{task.title}</Text>
    </TouchableOpacity>
  );
}
