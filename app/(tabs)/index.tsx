import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card } from '@/components/ui';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-slate-50 px-5 pt-16">
      <Text className="text-3xl font-semibold text-slate-950">Dashboard</Text>
      <Text className="mt-2 text-base text-slate-600">
        Free to spend and recent activity will appear here.
      </Text>

      <Card className="mt-6">
        <Text className="text-lg font-semibold text-slate-950">Accounts</Text>
        <Text className="mt-1 text-sm text-slate-600">
          Add and edit the accounts used for your budget.
        </Text>
        <View className="mt-4">
          <Button onPress={() => router.push('/accounts')} variant="secondary">
            Manage Accounts
          </Button>
        </View>
      </Card>
    </View>
  );
}
