import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: Platform.OS === 'ios' ? '#f8f8f8' : '#ffffff',
          },
          tabBarActiveTintColor: '#2196F3',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '計測',
            tabBarLabel: '計測',
          }}
        />
        <Tabs.Screen
          name="logs"
          options={{
            title: 'ログ',
            tabBarLabel: 'ログ',
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: '設定',
            tabBarLabel: '設定',
          }}
        />
      </Tabs>
    </>
  );
}
