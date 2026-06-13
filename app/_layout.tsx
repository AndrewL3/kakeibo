import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { database } from '@/db';

import '../global.css';

export default function RootLayout() {
  return (
    <DatabaseProvider database={database}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="accounts" />
        <Stack.Screen name="categories" />
        <Stack.Screen
          name="add-transaction"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen name="transaction/[id]" />
      </Stack>
      <StatusBar style="auto" />
    </DatabaseProvider>
  );
}
