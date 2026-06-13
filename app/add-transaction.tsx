import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Account, Category } from '@/db/models';
import { observeActiveAccounts } from '@/features/accounts';
import { observeActiveCategories } from '@/features/categories';
import {
  createTransactionWithSplits,
  getTodayDateInput,
  TransactionForm,
} from '@/features/transactions';
import type {
  TransactionFormValues,
  TransactionInput,
} from '@/features/transactions';

export default function AddTransactionScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const accountsSubscription = observeActiveAccounts().subscribe(setAccounts);
    const categoriesSubscription =
      observeActiveCategories().subscribe(setCategories);

    return () => {
      accountsSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
    };
  }, []);

  const initialValues = useMemo<TransactionFormValues>(
    () => ({
      accountId: accounts[0]?.id ?? null,
      amount: '',
      cleared: false,
      date: getTodayDateInput(),
      isTransfer: false,
      notes: '',
      payee: '',
      splits: [
        {
          amount: '',
          categoryId: categories[0]?.id ?? null,
          id: null,
          notes: '',
        },
      ],
      transferAccountId:
        accounts.find((account) => account.id !== accounts[0]?.id)?.id ?? null,
    }),
    [accounts, categories],
  );

  async function handleSubmit(input: TransactionInput) {
    await createTransactionWithSplits(input);
    router.back();
  }

  return (
    <SafeAreaView
      className="flex-1 justify-end bg-slate-900/40"
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="max-h-[92%]"
      >
        <View className="rounded-t-3xl bg-slate-50 px-5 pb-6 pt-3">
          <View className="items-center">
            <View className="h-1.5 w-12 rounded-full bg-slate-300" />
          </View>

          <ScrollView
            className="mt-4"
            contentContainerClassName="pb-4"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-2xl font-semibold text-slate-950">
              Quick Add
            </Text>
            <Text className="mt-1 text-sm text-slate-600">
              Record spending, income, or transfers.
            </Text>

            <View className="mt-5">
              {accounts.length === 0 ? (
                <View className="rounded-md border border-slate-200 bg-white p-4">
                  <Text className="text-base font-medium text-slate-950">
                    Setup required
                  </Text>
                  <Text className="mt-1 text-sm text-slate-600">
                    Add at least one account before recording a transaction.
                  </Text>
                </View>
              ) : (
                <TransactionForm
                  accounts={accounts}
                  categories={categories}
                  initialValues={initialValues}
                  onCancel={() => router.back()}
                  onSubmit={handleSubmit}
                  submitLabel="Save"
                  variant="quick-add"
                />
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
