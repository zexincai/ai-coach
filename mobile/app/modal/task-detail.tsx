import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useWeekPlanStore } from "../../stores/useWeekPlanStore";

export default function TaskDetailModal() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const existingTask = useWeekPlanStore((s) =>
    taskId ? s.tasks.find((t) => t.id === taskId) : null
  );
  const { addTask, updateTask } = useWeekPlanStore();

  const [title, setTitle] = useState(existingTask?.title || "");
  const [description, setDescription] = useState(existingTask?.description || "");
  const [duration, setDuration] = useState(
    existingTask?.estimated_duration?.toString() || "60"
  );
  const [priority, setPriority] = useState<"P0" | "P1" | "P2">(
    (existingTask?.priority as "P0" | "P1" | "P2") || "P2"
  );

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("提示", "请输入任务标题");
      return;
    }
    try {
      if (existingTask) {
        await updateTask(existingTask.id, {
          title: title.trim(),
          description: description.trim(),
          estimated_duration: parseInt(duration, 10) || 60,
          priority,
        } as any);
      } else {
        await addTask({
          title: title.trim(),
          description: description.trim(),
          estimated_duration: parseInt(duration, 10) || 60,
          priority,
        });
      }
      router.back();
    } catch {
      Alert.alert("错误", "保存失败，请重试");
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="flex-row justify-between items-center px-margin-mobile py-sm border-b border-surface-variant">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-body-md text-secondary">取消</Text>
        </TouchableOpacity>
        <Text className="text-headline-md text-on-surface">
          {existingTask ? "编辑任务" : "新建任务"}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Text className="text-body-md text-primary font-semibold">保存</Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 px-margin-mobile py-lg">
        <View className="flex-col gap-lg">
          <View>
            <Text className="text-label-md text-secondary mb-sm">任务标题</Text>
            <TextInput
              className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant text-body-md text-on-surface"
              placeholder="输入任务标题"
              placeholderTextColor="#737685"
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <View>
            <Text className="text-label-md text-secondary mb-sm">任务描述</Text>
            <TextInput
              className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant text-body-md text-on-surface min-h-[100px]"
              placeholder="输入任务描述"
              placeholderTextColor="#737685"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>
          <View className="flex-row gap-md">
            <View className="flex-1">
              <Text className="text-label-md text-secondary mb-sm">预计耗时 (分钟)</Text>
              <TextInput
                className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant text-body-md text-on-surface"
                placeholder="60"
                placeholderTextColor="#737685"
                keyboardType="numeric"
                value={duration}
                onChangeText={setDuration}
              />
            </View>
            <View className="flex-1">
              <Text className="text-label-md text-secondary mb-sm">优先级</Text>
              <View className="flex-row gap-sm">
                {(["P0", "P1", "P2"] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    className={`flex-1 h-11 rounded-xl items-center justify-center border ${
                      priority === p
                        ? "bg-primary-container border-primary"
                        : "bg-surface-container-lowest border-outline-variant"
                    }`}
                  >
                    <Text
                      className={`text-label-md ${
                        priority === p ? "text-white" : "text-on-surface-variant"
                      }`}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
