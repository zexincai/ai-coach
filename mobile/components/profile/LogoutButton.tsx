import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function LogoutButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      className="w-full px-xl py-3 rounded-xl flex-row items-center justify-center gap-2 mt-lg"
      style={{
        backgroundColor: "rgba(255,218,214,0.4)",
        borderWidth: 1,
        borderColor: "rgba(186,26,26,0.2)",
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="log-out-outline" size={18} color="#ba1a1a" />
      <Text className="text-label-md text-[#ba1a1a]">退出登录</Text>
    </TouchableOpacity>
  );
}
