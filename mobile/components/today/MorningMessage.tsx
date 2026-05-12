import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function MorningMessage({ message }: { message: string }) {
  return (
    <View className="bg-primary/5 rounded-xl p-md border border-primary/10 flex-row items-start gap-sm">
      <Ionicons name="bulb" size={20} color="#003d9b" style={{ marginTop: 2 }} />
      <Text className="text-body-md text-on-surface-variant italic flex-1">{message}</Text>
    </View>
  );
}
