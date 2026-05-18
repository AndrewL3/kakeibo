import { Text, View } from 'react-native'

export default function TransactionsScreen() {
  return (
    <View className="flex-1 bg-slate-50 px-5 pt-16">
      <Text className="text-3xl font-semibold text-slate-950">Transactions</Text>
      <Text className="mt-2 text-base text-slate-600">Transaction history and filters will appear here.</Text>
    </View>
  );
}


