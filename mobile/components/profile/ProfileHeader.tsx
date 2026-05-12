import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ProfileHeaderProps {
  name: string;
  subtitle: string;
}

export function ProfileHeader({ name, subtitle }: ProfileHeaderProps) {
  return (
    <View className="items-center py-lg">
      <View className="relative mb-md">
        <View className="w-24 h-24 rounded-full bg-secondary-container items-center justify-center border-4 border-surface shadow-lg">
          <Ionicons name="person" size={48} color="#003d9b" />
        </View>
        <TouchableOpacity className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 shadow-md">
          <Ionicons name="pencil" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text className="text-headline-md text-on-surface">{name}</Text>
      <Text className="text-label-md text-secondary mt-1">{subtitle}</Text>
    </View>
  );
}
