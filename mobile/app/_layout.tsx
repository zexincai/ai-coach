import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../stores/useAuthStore";

const queryClient = new QueryClient();

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal/evening-review" options={{ presentation: "modal", title: "晚间复盘" }} />
        <Stack.Screen name="modal/task-detail" options={{ presentation: "modal", title: "任务详情" }} />
      </Stack>
    </QueryClientProvider>
  );
}
