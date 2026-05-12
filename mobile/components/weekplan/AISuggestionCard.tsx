import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  suggestion: string;
  onAdjust: () => void;
  onIgnore: () => void;
}

export function AISuggestionCard({ suggestion, onAdjust, onIgnore }: Props) {
  return (
    <View className="bg-secondary-fixed/30 rounded-xl p-lg border border-secondary-container flex-col gap-md">
      <View className="flex-row items-start gap-md">
        <View className="w-12 h-12 rounded-full bg-surface-container-lowest items-center justify-center shadow-sm">
          <Ionicons name="sparkles" size={24} color="#003d9b" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-xs mb-xs">
            <Text className="text-[18px] font-semibold text-on-surface">AI 日程优化建议</Text>
            <View className="px-xs py-0.5 rounded bg-primary">
              <Text className="text-[10px] text-white font-semibold tracking-wider">Beta</Text>
            </View>
          </View>
          <Text className="text-body-md text-secondary">
            {suggestion}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-sm">
        <TouchableOpacity
          onPress={onIgnore}
          className="flex-1 h-11 rounded-xl bg-surface-container-lowest border border-outline-variant items-center justify-center"
        >
          <Text className="text-label-md text-secondary">忽略</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAdjust}
          className="flex-1 h-11 rounded-xl bg-primary items-center justify-center"
        >
          <Text className="text-label-md text-white">一键调整</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
