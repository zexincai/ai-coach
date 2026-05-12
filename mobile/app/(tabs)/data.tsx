import { useEffect, useState } from "react";
import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { TopAppBar } from "../../components/common/TopAppBar";
import { CompletionRate } from "../../components/data/CompletionRate";
import { PeakEnergyChart } from "../../components/data/PeakEnergyChart";
import { DelayPatternCard } from "../../components/data/DelayPatternCard";
import { ImprovementTipItem } from "../../components/data/ImprovementTipItem";
import { apiAnalytics } from "../../api/analytics";
import { WeeklyReport } from "../../types/models";
import { getWeekStart } from "../../utils/date";

export default function DataScreen() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setIsLoading(true);
    try {
      const data = await apiAnalytics.fetchWeekly(getWeekStart());
      setReport(data);
    } catch {}
    setIsLoading(false);
  }

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
      <ScrollView className="flex-1 px-margin-mobile py-lg">
        {/* Header */}
        <View className="mb-xl">
          <Text className="text-headline-xl text-primary mb-sm">进化报告</Text>
          <Text className="text-body-md text-secondary">本周数据深度剖析与效能洞察</Text>
        </View>

        <View className="flex-col gap-lg">
          {/* Completion Rate */}
          <CompletionRate rate={report?.completion_rate || 0} />

          {/* Peak Energy */}
          <PeakEnergyChart periods={report?.peak_energy_periods || []} />

          {/* Delay Patterns */}
          <DelayPatternCard patterns={report?.delay_patterns || []} />

          {/* AI Improvement Suggestions */}
          <View className="bg-primary-container rounded-xl p-lg">
            <View className="flex-row items-center gap-sm mb-lg">
              <Ionicons name="bulb" size={20} color="#fff" />
              <Text className="text-headline-md text-white">AI 效能改进建议</Text>
            </View>
            {(report?.suggestions || []).length > 0 ? (
              (report?.suggestions || []).map((s, i) => (
                <View key={i} className="mb-sm">
                  <ImprovementTipItem suggestion={s} />
                </View>
              ))
            ) : (
              <Text className="text-body-md text-primary-fixed-dim">
                暂无数据，完成一周任务后将生成个性化建议。
              </Text>
            )}
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
