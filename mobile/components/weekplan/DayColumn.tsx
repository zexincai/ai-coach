import { View, Text } from "react-native";
import { Task } from "../../types/models";
import { WeekTaskCard } from "./WeekTaskCard";
import { EmptyState } from "../common/EmptyState";

const dayLabels = ["一", "二", "三", "四", "五"];

interface DayColumnProps {
  dayIndex: number;
  date: string;
  tasks: Task[];
  isToday: boolean;
  onAddTask: () => void;
}

export function DayColumn({ dayIndex, date, tasks, isToday, onAddTask }: DayColumnProps) {
  return (
    <View className="flex-col gap-md flex-1">
      <View className="flex-row items-center gap-xs">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center ${
            isToday ? "bg-secondary-container" : "bg-surface-container-high"
          }`}
        >
          <Text
            className={`text-label-md ${
              isToday ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            {dayLabels[dayIndex]}
          </Text>
        </View>
        <Text className="text-label-md text-secondary">{date}</Text>
      </View>
      {tasks.length > 0 ? (
        tasks.map((task) => <WeekTaskCard key={task.id} task={task} />)
      ) : (
        <EmptyState text="添加任务" onPress={onAddTask} height={100} />
      )}
    </View>
  );
}
