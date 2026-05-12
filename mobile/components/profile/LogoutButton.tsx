import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function LogoutButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      className="w-full px-xl py-3 rounded-xl bg-red-100 border border-red-200 flex-row items-center justify-center gap-2 mt-lg"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="log-out-outline" size={18} color="#ba1a1a" />
      <Text className="text-label-md text-[#ba1a1a]">退出登录</Text>
    </TouchableOpacity>
  );
}
