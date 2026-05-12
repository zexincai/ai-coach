import { useEffect } from "react";
import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWeekPlanStore } from "../../stores/useWeekPlanStore";
import { TopAppBar } from "../../components/common/TopAppBar";
import { WeekHeader } from "../../components/weekplan/WeekHeader";
import { DayColumn } from "../../components/weekplan/DayColumn";
import { AISuggestionCard } from "../../components/weekplan/AISuggestionCard";

function getWeekLabel(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return `第 ${Math.ceil((diff / (1000 * 60 * 60 * 24) + start.getDay() + 1) / 7)} 周计划`;
}

function getDateRange(weekStart: Date): string {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 4);
  const fmt = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${fmt(weekStart)} - ${fmt(end)}`;
}

export default function WeekPlanScreen() {
  const {
    currentPlan, tasks, isGenerating, isLoading,
    fetchCurrentWeek, confirmPlan,
  } = useWeekPlanStore();

  useEffect(() => {
    fetchCurrentWeek();
  }, []);

  if (isLoading || !currentPlan) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#003d9b" />
      </SafeAreaView>
    );
  }

  const weekStart = new Date(currentPlan.start_date);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // Group tasks by day
  const tasksByDay: Record<string, typeof tasks> = {};
  for (let i = 0; i < 5; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    tasksByDay[d.toISOString().slice(0, 10)] = [];
  }
  tasks.forEach((t) => {
    if (tasksByDay[t.scheduled_date]) {
      tasksByDay[t.scheduled_date].push(t);
    }
  });

  const dayDates = Object.keys(tasksByDay).sort();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <TopAppBar />
      <ScrollView className="flex-1 px-margin-mobile pt-lg">
        {/* Week Header */}
        <WeekHeader
          plan={currentPlan}
          weekLabel={getWeekLabel(weekStart)}
          dateRange={getDateRange(weekStart)}
          onConfirm={confirmPlan}
        />

        {/* Timeline Grid */}
        {isGenerating ? (
          <View className="items-center justify-center py-xl mt-lg">
            <ActivityIndicator size="large" color="#003d9b" />
            <Text className="text-body-md text-secondary mt-md">AI 正在生成周计划...</Text>
          </View>
        ) : (
          <View className="flex-col gap-md mt-lg">
            {dayDates.map((dateStr, i) => {
              const d = new Date(dateStr);
              const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
              return (
                <DayColumn
                  key={dateStr}
                  dayIndex={i}
                  date={dateLabel}
                  tasks={tasksByDay[dateStr]}
                  isToday={dateStr === todayStr}
                  onAddTask={() => {}}
                />
              );
            })}
          </View>
        )}

        {/* AI Suggestion */}
        <View className="mt-lg mb-24">
          <AISuggestionCard
            suggestion="检测到周二下午有连续 3 小时的会议安排。建议在任务后预留 30 分钟的缓冲时间，以降低认知负荷并保持高效状态。"
            onAdjust={() => {}}
            onIgnore={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
