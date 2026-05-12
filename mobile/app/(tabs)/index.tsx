import { useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTaskStore } from "../../stores/useTaskStore";
import { TopAppBar } from "../../components/common/TopAppBar";
import { SectionHeader } from "../../components/common/SectionHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { MorningMessage } from "../../components/today/MorningMessage";
import { CoreTaskCard } from "../../components/today/CoreTaskCard";
import { OverdueTaskCard } from "../../components/today/OverdueTaskCard";
import { RemainingTaskItem } from "../../components/today/RemainingTaskItem";
import { FocusStartButton } from "../../components/today/FocusStartButton";

export default function TodayScreen() {
  const {
    coreTasks, remainingTasks, overdueTasks,
    morningMessage, isLoading,
    fetchTodayData, toggleComplete,
  } = useTaskStore();

  useEffect(() => {
    fetchTodayData();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#003d9b" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <TopAppBar />
      <ScrollView className="flex-1 px-margin-mobile pt-lg">
        {/* Page Header */}
        <View className="mb-lg">
          <Text className="text-headline-lg text-on-surface mb-sm">今日专注</Text>
          <MorningMessage message={morningMessage} />
        </View>

        {/* Bento Grid */}
        <View className="flex-col gap-gutter">
          {/* Core Tasks */}
          <View>
            <SectionHeader icon="flash" title="Top 3 核心任务" />
            <View className="flex-col gap-md">
              {coreTasks.slice(0, 3).map((task) => (
                <CoreTaskCard
                  key={task.id}
                  task={task}
                  onPress={() => {}}
                  onComplete={() => toggleComplete(task.id)}
                />
              ))}
              {coreTasks.length < 3 && (
                <EmptyState
                  icon="add-circle-outline"
                  text={`添加第 ${coreTasks.length + 1} 项核心任务`}
                  height={160}
                />
              )}
            </View>
          </View>

          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <View>
              <SectionHeader icon="warning" title="需要关注" color="#ba1a1a" uppercase />
              {overdueTasks.map((task) => (
                <OverdueTaskCard key={task.id} task={task} />
              ))}
            </View>
          )}

          {/* Remaining Tasks */}
          {remainingTasks.length > 0 && (
            <View>
              <SectionHeader icon="list" title="其他待办" uppercase />
              {remainingTasks.map((task) => (
                <RemainingTaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleComplete(task.id)}
                />
              ))}
            </View>
          )}

          {/* Focus Button */}
          <FocusStartButton onPress={() => {}} />
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
