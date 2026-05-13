import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function FocusStartButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      className="w-full h-11 bg-primary rounded-xl flex-row items-center justify-center gap-sm mt-md"
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        shadowColor: "rgba(0,61,155,0.39)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 14,
        elevation: 6,
      }}
    >
      <Ionicons name="play" size={18} color="#fff" />
      <Text className="text-label-md text-white">一键开始专注</Text>
    </TouchableOpacity>
  );
}
