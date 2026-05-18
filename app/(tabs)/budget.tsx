import { Text, View } from 'react-native';

export default function BudgetScreen() {
  return (
    <View className="flex-1 bg-slate-50 px-5 pt-16">
      <Text className="text-3xl font-semibold text-slate-950">Budget</Text>
      <Text className="mt-2 text-base text-slate-600">Monthly allocations and category balances will appear here.</Text>
    </View>
  );
}
