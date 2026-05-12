import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CompletionRateProps {
  rate: number; // 0-1
}

export function CompletionRate({ rate }: CompletionRateProps) {
  const percentage = Math.round(rate * 100);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashLength = circumference * rate;

  return (
    <View className="bg-[#E6F0FF] rounded-xl p-lg items-center justify-center shadow-sm">
      <Text className="text-headline-md text-on-surface mb-lg">本周完成率</Text>
      <View className="w-48 h-48 items-center justify-center">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
          <Circle cx="50" cy="50" r={radius} fill="none" stroke="#E6F0FF" strokeWidth="10" />
          <Circle
            cx="50" cy="50" r={radius} fill="none" stroke="#003d9b"
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dashLength} ${circumference}`}
          />
        </Svg>
        <View className="items-center">
          <Text className="text-headline-xl text-primary">{percentage}%</Text>
          <Text className="text-label-sm text-secondary">目标达成</Text>
        </View>
      </View>
    </View>
  );
}
