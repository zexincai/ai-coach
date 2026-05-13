import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DelayPattern } from "../../types/models";

interface DelayPatternCardProps {
  patterns: DelayPattern[];
}

const reasonConfig: Record<string, { title: string; description: string; icon: keyof typeof Ionicons.glyphMap; bgColor: string; accentColor: string }> = {
  underestimated: {
    title: "预估不足",
    description: "复杂任务的初始时间评估普遍低于实际耗时。通常发生在研究性或无先例任务上。",
    icon: "hourglass-outline",
    bgColor: "rgba(255,218,214,0.4)",
    accentColor: "#ba1a1a",
  },
  interrupted: {
    title: "突发干扰",
    description: "主要集中在下午时段，外部消息或临时会议打断了深度工作流，导致任务顺延。",
    icon: "notifications-off-outline",
    bgColor: "rgba(218,226,255,0.4)",
    accentColor: "#003d9b",
  },
  procrastinated: {
    title: "拖延",
    description: "任务有一定复杂度但非紧急，倾向于反复推迟到后续日期。",
    icon: "timer-outline",
    bgColor: "rgba(255,224,178,0.4)",
    accentColor: "#f57c00",
  },
  too_hard: {
    title: "任务太难",
    description: "任务规模过大或技能不匹配，需要拆解为更小的可交付步骤。",
    icon: "warning-outline",
    bgColor: "rgba(255,218,214,0.4)",
    accentColor: "#ba1a1a",
  },
};

export function DelayPatternCard({ patterns }: DelayPatternCardProps) {
  return (
    <View
      className="rounded-xl p-lg"
      style={{
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#c3c6d6",
        shadowColor: "rgba(0,0,0,0.05)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center gap-sm mb-lg">
        <Ionicons name="warning" size={20} color="#ba1a1a" />
        <Text className="text-headline-md text-on-surface">延期模式深度分析</Text>
      </View>
      <View className="flex-col gap-md">
        {patterns.length > 0 ? (
          patterns.map((p, i) => {
            const config = reasonConfig[p.reason] || {
              title: p.reason,
              description: "",
              icon: "help-circle-outline" as const,
              bgColor: "rgba(240,237,237,0.4)",
              accentColor: "#555f6c",
            };
            return (
              <View key={i} className="p-md rounded-lg flex-row gap-md" style={{ backgroundColor: config.bgColor }}>
                <View className="w-10 h-10 rounded-full bg-white items-center justify-center">
                  <Ionicons name={config.icon} size={18} color={config.accentColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-label-md text-on-surface font-bold mb-xs">
                    {config.title} ({Math.round(p.percentage * 100)}%)
                  </Text>
                  <Text className="text-body-md text-secondary">{config.description}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text className="text-body-md text-secondary">本周暂无延期数据</Text>
        )}
      </View>
    </View>
  );
}
