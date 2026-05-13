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
        <View
          className="w-24 h-24 rounded-full bg-secondary-container items-center justify-center"
          style={{
            borderWidth: 4,
            borderColor: "#fcf9f8",
            shadowColor: "rgba(0,61,155,0.1)",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 20,
            elevation: 6,
          }}
        >
          <Ionicons name="person" size={48} color="#003d9b" />
        </View>
        <TouchableOpacity
          className="absolute bottom-0 right-0 rounded-full p-1.5"
          style={{
            backgroundColor: "#003d9b",
            shadowColor: "rgba(0,0,0,0.15)",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Ionicons name="pencil" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text className="text-headline-md text-on-surface">{name}</Text>
      <Text className="text-label-md text-secondary mt-1">{subtitle}</Text>
    </View>
  );
}
