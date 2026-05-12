import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Task, DelayReason } from "../../types/models";
import { useTaskStore } from "../../stores/useTaskStore";
import { apiReviews } from "../../api/reviews";

const delayReasonLabels: { value: DelayReason; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "underestimated", label: "预估不足", icon: "hourglass-outline" },
  { value: "interrupted", label: "突发干扰", icon: "notifications-off-outline" },
  { value: "procrastinated", label: "拖延", icon: "timer-outline" },
  { value: "too_hard", label: "任务太难", icon: "warning-outline" },
];

export default function EveningReviewModal() {
  const { coreTasks, remainingTasks, overdueTasks, fetchTodayData } = useTaskStore();
  const allPending = [...coreTasks, ...remainingTasks, ...overdueTasks].filter(
    (t) => t.status === "pending"
  );
  const [updates, setUpdates] = useState<Record<string, { status: string; reason: DelayReason | null }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initial: Record<string, any> = {};
    allPending.forEach((t) => {
      initial[t.id] = { status: "rolled_over", reason: null };
    });
    setUpdates(initial);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const taskUpdates = Object.entries(updates).map(([taskId, u]) => ({
        task_id: taskId,
        status: u.status as "rolled_over" | "skipped",
        delay_reason: u.reason || undefined,
      }));
      const result = await apiReviews.submitRollover(
        new Date().toISOString().slice(0, 10),
        taskUpdates
      );

      await fetchTodayData();

      Alert.alert(
        "复盘完成",
        `${result.adjustment?.coach_note || "任务已自动顺延至明天。"}\n\n${result.reassessment_alerts?.length ? `有 ${result.reassessment_alerts.length} 项任务需要重新评估。` : ""}`,
        [{ text: "好的", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("提交失败", "请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row justify-between items-center px-margin-mobile py-sm border-b border-surface-variant">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-body-md text-secondary">取消</Text>
        </TouchableOpacity>
        <Text className="text-headline-md text-on-surface">晚间复盘</Text>
        <View className="w-12" />
      </View>
      <ScrollView className="flex-1 px-margin-mobile py-lg">
        <Text className="text-body-md text-secondary mb-lg">
          今天过得怎么样？来做个简短复盘吧。
        </Text>
        {allPending.length === 0 ? (
          <View className="items-center py-xl">
            <Ionicons name="checkmark-circle" size={48} color="#2e7d32" />
            <Text className="text-headline-md text-on-surface mt-md">全部完成！</Text>
            <Text className="text-body-md text-secondary mt-sm">今天表现很棒！</Text>
          </View>
        ) : (
          allPending.map((task) => (
            <View key={task.id} className="bg-surface-container-lowest rounded-xl p-md mb-md border border-surface-variant">
              <Text className="text-body-lg font-semibold text-on-surface mb-md">{task.title}</Text>
              <View className="flex-row gap-sm mb-sm">
                <TouchableOpacity
                  className={`flex-1 h-10 rounded-lg items-center justify-center ${
                    updates[task.id]?.status === "rolled_over"
                      ? "bg-primary"
                      : "bg-surface-container-high"
                  }`}
                  onPress={() => setUpdates((p) => ({ ...p, [task.id]: { ...p[task.id], status: "rolled_over" } }))}
                >
                  <Text className={`text-label-sm ${updates[task.id]?.status === "rolled_over" ? "text-white" : "text-secondary"}`}>
                    顺延至明天
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 h-10 rounded-lg items-center justify-center ${
                    updates[task.id]?.status === "skipped"
                      ? "bg-primary"
                      : "bg-surface-container-high"
                  }`}
                  onPress={() => setUpdates((p) => ({ ...p, [task.id]: { ...p[task.id], status: "skipped" } }))}
                >
                  <Text className={`text-label-sm ${updates[task.id]?.status === "skipped" ? "text-white" : "text-secondary"}`}>
                    跳过
                  </Text>
                </TouchableOpacity>
              </View>
              <Text className="text-label-sm text-secondary mb-sm">延期原因（可选）</Text>
              <View className="flex-row flex-wrap gap-xs">
                {delayReasonLabels.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    className={`px-sm py-xs rounded-full flex-row items-center gap-xs ${
                      updates[task.id]?.reason === r.value
                        ? "bg-primary-container"
                        : "bg-surface-container-high"
                    }`}
                    onPress={() => setUpdates((p) => ({ ...p, [task.id]: { ...p[task.id], reason: r.value } }))}
                  >
                    <Ionicons
                      name={r.icon}
                      size={14}
                      color={updates[task.id]?.reason === r.value ? "#fff" : "#555f6c"}
                    />
                    <Text
                      className={`text-label-sm ${updates[task.id]?.reason === r.value ? "text-white" : "text-secondary"}`}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
      {allPending.length > 0 && (
        <View className="px-margin-mobile py-md border-t border-surface-variant">
          <TouchableOpacity
            className={`w-full h-11 rounded-xl items-center justify-center ${isSubmitting ? "bg-primary/50" : "bg-primary"}`}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.9}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-label-md text-white">提交复盘</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
