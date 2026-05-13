import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function MorningMessage({ message }: { message: string }) {
  return (
    <View
      className="rounded-xl p-md flex-row items-start gap-sm"
      style={{
        backgroundColor: "rgba(0,61,155,0.05)",
        borderWidth: 1,
        borderColor: "rgba(0,61,155,0.10)",
      }}
    >
      <Ionicons name="bulb" size={20} color="#003d9b" style={{ marginTop: 2 }} />
      <Text className="text-body-md text-on-surface-variant flex-1" style={{ fontStyle: "italic" }}>
        {message}
      </Text>
    </View>
  );
}
