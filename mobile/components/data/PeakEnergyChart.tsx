import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PeakEnergyPeriod } from "../../types/models";

interface PeakEnergyChartProps {
  periods: PeakEnergyPeriod[];
}

export function PeakEnergyChart({ periods }: PeakEnergyChartProps) {
  const defaultPeriods = periods.length > 0 ? periods : [
    { time_slot: "08:00", completion_rate: 0.25 },
    { time_slot: "10:00", completion_rate: 1.0 },
    { time_slot: "12:00", completion_rate: 0.75 },
    { time_slot: "14:00", completion_rate: 0.5 },
    { time_slot: "16:00", completion_rate: 0.33 },
    { time_slot: "18:00", completion_rate: 0.2 },
  ];

  const peakPeriod = defaultPeriods.reduce((a, b) =>
    a.completion_rate > b.completion_rate ? a : b
  );

  return (
    <View className="bg-[#E6F0FF] rounded-xl p-lg shadow-sm">
      <View className="flex-row items-center justify-between mb-md">
        <Text className="text-headline-md text-on-surface">精力巅峰时段分析</Text>
        <Ionicons name="flash" size={20} color="#003d9b" />
      </View>
      <View className="bg-white rounded-lg p-md">
        <View className="flex-row items-end justify-between h-32 gap-xs mb-sm px-sm">
          {defaultPeriods.map((p, i) => (
            <View key={i} className="flex-1 items-center">
              {p.time_slot === peakPeriod.time_slot && (
                <View className="bg-primary px-2 py-0.5 rounded -mt-6 mb-1">
                  <Text className="text-label-sm text-white">巅峰</Text>
                </View>
              )}
              <View
                className={`w-full rounded-t-sm ${
                  p.time_slot === peakPeriod.time_slot
                    ? "bg-primary"
                    : "bg-secondary-container"
                }`}
                style={{ height: `${p.completion_rate * 100}%` }}
              />
            </View>
          ))}
        </View>
        <View className="flex-row justify-between px-sm">
          {defaultPeriods.map((p, i) => (
            <Text key={i} className="text-label-sm text-secondary">{p.time_slot}</Text>
          ))}
        </View>
        <Text className="text-body-md text-on-surface-variant mt-md">
          核心洞察：您的最高效时段集中在{" "}
          <Text className="text-primary font-bold">{peakPeriod.time_slot}</Text>
          。建议将高认知负荷任务安排在此区间。
        </Text>
      </View>
    </View>
  );
}
