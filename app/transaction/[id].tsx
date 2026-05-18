import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-slate-50 px-5 pt-16">
      <Text className="text-3xl font-semibold text-slate-950">Transaction Detail</Text>
      <Text className="mt-2 text-base text-slate-600">Editing transaction {id} will appear here.</Text>
    </View>
  );
}
