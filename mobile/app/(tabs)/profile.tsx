import { View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../stores/useAuthStore";
import { apiUsers } from "../../api/users";
import { TopAppBar } from "../../components/common/TopAppBar";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { PreferenceRow } from "../../components/profile/PreferenceRow";
import { ToggleRow } from "../../components/profile/ToggleRow";
import { LogoutButton } from "../../components/profile/LogoutButton";
import { UserPreferences } from "../../types/models";

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();

  const prefs: UserPreferences = user?.preferences || {
    work_hours: { start: "09:00", end: "18:00" },
    peak_energy_time: "morning",
    notification_enabled: true,
    learning_mode_enabled: false,
  };

  const peakEnergyLabel: Record<string, string> = {
    morning: "10:00 - 12:00",
    afternoon: "14:00 - 16:00",
    evening: "19:00 - 21:00",
  };

  const handleLogout = () => {
    Alert.alert("退出登录", "确定要退出登录吗？", [
      { text: "取消", style: "cancel" },
      { text: "退出", style: "destructive", onPress: logout },
    ]);
  };

  const updatePrefs = async (patch: Partial<UserPreferences>) => {
    const newPrefs = { ...prefs, ...patch };
    try {
      const updated = await apiUsers.updatePreferences(newPrefs);
      if (user) {
        setUser({ ...user, preferences: updated.preferences || newPrefs });
      }
    } catch {
      Alert.alert("错误", "设置更新失败");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <TopAppBar />
      <ScrollView className="flex-1">
        <ProfileHeader
          name={user?.name || "用户"}
          subtitle="高效能实践者"
        />

        <View className="px-margin-mobile mt-lg">
          <View className="bg-secondary-container/30 rounded-xl overflow-hidden border border-secondary-container/50">
            <PreferenceRow
              icon="time-outline"
              label="工作时间"
              value={`${prefs.work_hours.start} - ${prefs.work_hours.end}`}
            />
            <PreferenceRow
              icon="flash"
              label="巅峰精力"
              value={peakEnergyLabel[prefs.peak_energy_time] || "10:00 - 12:00"}
            />
          </View>
        </View>

        <View className="px-margin-mobile mt-md">
          <View className="bg-secondary-container/30 rounded-xl overflow-hidden border border-secondary-container/50">
            <ToggleRow
              icon="notifications-outline"
              label="系统通知管理"
              value={prefs.notification_enabled}
              onToggle={() => updatePrefs({ notification_enabled: !prefs.notification_enabled })}
            />
            <ToggleRow
              icon="school-outline"
              label="学习模式开关"
              value={prefs.learning_mode_enabled}
              onToggle={() => updatePrefs({ learning_mode_enabled: !prefs.learning_mode_enabled })}
            />
            <PreferenceRow
              icon="download-outline"
              label="数据导出"
              value=""
            />
          </View>
        </View>

        <View className="px-margin-mobile items-center">
          <LogoutButton onPress={handleLogout} />
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
