import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui';
import type { Account, Category } from '@/db/models';
import { observeActiveAccounts } from '@/features/accounts';
import { observeActiveCategories } from '@/features/categories';
import {
  fetchTransactionEditorData,
  formatDateInput,
  TransactionForm,
  updateTransactionWithSplits,
} from '@/features/transactions';
import type {
  TransactionEditorData,
  TransactionFormValues,
  TransactionInput,
} from '@/features/transactions';
import { DEFAULT_CURRENCY, formatMoneyInput } from '@/lib';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editorData, setEditorData] = useState<TransactionEditorData | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const accountsSubscription = observeActiveAccounts().subscribe(setAccounts);
    const categoriesSubscription =
      observeActiveCategories().subscribe(setCategories);

    return () => {
      accountsSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    if (!id) {
      setLoadError('Transaction was not found.');
      return;
    }

    fetchTransactionEditorData(id)
      .then((data) => {
        if (!isCurrent) {
          return;
        }

        setEditorData(data);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        console.warn('Failed to load transaction', error);

        if (isCurrent) {
          setLoadError('Transaction was not found.');
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [id]);

  const initialValues = useMemo<TransactionFormValues | null>(() => {
    if (!editorData) {
      return null;
    }

    const account = accounts.find(
      (item) => item.id === editorData.transaction.accountId,
    );
    const currency = account?.currency ?? DEFAULT_CURRENCY;

    return {
      accountId: editorData.transaction.accountId,
      amount: formatMoneyInput(editorData.transaction.amount, currency),
      cleared: editorData.transaction.cleared,
      date: formatDateInput(editorData.transaction.date),
      isTransfer: editorData.transaction.isTransfer,
      notes: editorData.transaction.notes ?? '',
      payee: editorData.transaction.payee ?? '',
      splits:
        editorData.splits.length > 0
          ? editorData.splits.map((split) => ({
              amount: formatMoneyInput(split.amount, currency),
              categoryId: split.categoryId,
              id: split.id,
              notes: split.notes ?? '',
            }))
          : [
              {
                amount: formatMoneyInput(
                  editorData.transaction.amount,
                  currency,
                ),
                categoryId: null,
                id: null,
                notes: '',
              },
            ],
      transferAccountId: editorData.transaction.transferAccountId,
    };
  }, [accounts, editorData]);

  async function handleSubmit(input: TransactionInput) {
    if (!id) {
      return;
    }

    await updateTransactionWithSplits(id, input);
    router.back();
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-24 pt-6"
      >
        <Text className="text-3xl font-semibold text-slate-950">
          Edit Transaction
        </Text>
        <Text className="mt-2 text-base text-slate-600">
          Update transaction details, category splits, or transfer accounts.
        </Text>

        <Card className="mt-6">
          {loadError ? (
            <View>
              <Text className="text-base font-medium text-slate-950">
                Could not load transaction
              </Text>
              <Text className="mt-1 text-sm text-slate-600">{loadError}</Text>
            </View>
          ) : null}

          {!loadError && initialValues && accounts.length > 0 ? (
            <TransactionForm
              accounts={accounts}
              categories={categories}
              initialValues={initialValues}
              onCancel={() => router.back()}
              onSubmit={handleSubmit}
              submitLabel="Save"
            />
          ) : null}

          {!loadError && !initialValues ? (
            <Text className="text-base text-slate-600">Loading...</Text>
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
