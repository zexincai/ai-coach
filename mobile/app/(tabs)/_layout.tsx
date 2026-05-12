import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#003d9b",
        tabBarInactiveTintColor: "#555f6c",
        tabBarStyle: {
          backgroundColor: "#fcf9f8",
          borderTopColor: "rgba(12,86,208,0.04)",
          shadowColor: "rgba(12,86,208,0.04)",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 20,
          elevation: 8,
          paddingTop: 4,
          paddingBottom: 24,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "今日",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="week-plan"
        options={{
          title: "周计划",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar-outline" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: "数据",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "stats-chart" : "stats-chart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "个人中心",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
