import { useRouter } from 'expo-router';
import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AmountDisplay,
  Button,
  Card,
  Input,
  MonthPicker,
} from '@/components/ui';
import type {
  Account,
  Category,
  Transaction,
  TransactionSplit,
} from '@/db/models';
import { observeActiveAccounts } from '@/features/accounts';
import { observeActiveCategories } from '@/features/categories';
import {
  buildTransactionListItems,
  filterTransactionListItems,
  getCategoryFilterLabel,
  groupTransactionListItems,
  observeTransactionSplits,
  observeTransactions,
} from '@/features/transactions';
import type {
  ClearedFilter,
  DateRangeFilter,
  TransactionDateGroup,
  TransactionListItem,
} from '@/features/transactions';
import { useAppStore } from '@/stores';

interface FilterPillProps {
  isSelected: boolean;
  label: string;
  onPress: () => void;
}

const FilterPill = memo(function FilterPill({
  isSelected,
  label,
  onPress,
}: FilterPillProps) {
  return (
    <Pressable
      className={`min-h-11 rounded-md border px-3 py-2 ${
        isSelected
          ? 'border-emerald-700 bg-emerald-50'
          : 'border-slate-300 bg-white'
      }`}
      onPress={onPress}
    >
      <Text className="text-sm font-medium text-slate-950">{label}</Text>
    </Pressable>
  );
});

function getAmountClassName(amount: number): string {
  if (amount > 0) {
    return 'text-emerald-700';
  }

  if (amount < 0) {
    return 'text-red-700';
  }

  return 'text-slate-950';
}

interface TransactionRowProps {
  item: TransactionListItem;
  onPress: (transactionId: string) => void;
}

const TransactionRow = memo(function TransactionRow({
  item,
  onPress,
}: TransactionRowProps) {
  const accountLabel =
    item.isTransfer && item.transferAccountName
      ? `${item.accountName} -> ${item.transferAccountName}`
      : item.accountName;

  return (
    <Pressable
      className="border-t border-slate-100 py-3 active:bg-slate-50"
      onPress={() => onPress(item.id)}
    >
      <View className="flex-row items-start gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-base font-semibold text-slate-950">
            {item.payee}
          </Text>
          <Text className="mt-1 text-sm text-slate-600">{accountLabel}</Text>
          {item.notes ? (
            <Text className="mt-1 text-sm text-slate-500">{item.notes}</Text>
          ) : null}
          <View className="mt-2 flex-row flex-wrap gap-2">
            <View
              className={`rounded-md px-2 py-1 ${
                item.isTransfer ? 'bg-violet-100' : 'bg-slate-100'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  item.isTransfer ? 'text-violet-800' : 'text-slate-700'
                }`}
              >
                {item.categoryLabel}
              </Text>
            </View>
            <View
              className={`rounded-md px-2 py-1 ${
                item.isCleared ? 'bg-emerald-100' : 'bg-amber-100'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  item.isCleared ? 'text-emerald-800' : 'text-amber-800'
                }`}
              >
                {item.isCleared ? 'Cleared' : 'Uncleared'}
              </Text>
            </View>
          </View>
        </View>

        <AmountDisplay
          amount={item.amount}
          className={`text-base ${getAmountClassName(item.amount)}`}
          currency={item.currency}
          showSign
        />
      </View>
    </Pressable>
  );
});

interface TransactionDateGroupCardProps {
  group: TransactionDateGroup;
  onTransactionPress: (transactionId: string) => void;
}

const TransactionDateGroupCard = memo(function TransactionDateGroupCard({
  group,
  onTransactionPress,
}: TransactionDateGroupCardProps) {
  return (
    <Card>
      <Text className="text-sm font-semibold uppercase text-slate-500">
        {group.dateLabel}
      </Text>
      <View className="mt-2">
        {group.transactions.map((item) => (
          <TransactionRow
            item={item}
            key={item.id}
            onPress={onTransactionPress}
          />
        ))}
      </View>
    </Card>
  );
});

export default function TransactionsScreen() {
  const router = useRouter();
  const selectedMonth = useAppStore((state) => state.selectedMonth);
  const setSelectedMonth = useAppStore((state) => state.setSelectedMonth);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionSplits, setTransactionSplits] = useState<
    TransactionSplit[]
  >([]);
  const [accountFilterId, setAccountFilterId] = useState<string | null>(null);
  const [categoryFilterId, setCategoryFilterId] = useState<string | null>(null);
  const [clearedFilter, setClearedFilter] = useState<ClearedFilter>('all');
  const [dateRangeFilter, setDateRangeFilter] =
    useState<DateRangeFilter>('all');
  const [payeeSearch, setPayeeSearch] = useState('');

  useEffect(() => {
    const accountsSubscription = observeActiveAccounts().subscribe(setAccounts);
    const categoriesSubscription =
      observeActiveCategories().subscribe(setCategories);
    const transactionsSubscription =
      observeTransactions().subscribe(setTransactions);
    const splitsSubscription =
      observeTransactionSplits().subscribe(setTransactionSplits);

    return () => {
      accountsSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
      transactionsSubscription.unsubscribe();
      splitsSubscription.unsubscribe();
    };
  }, []);

  const categoriesById = useMemo(
    () =>
      new Map(categories.map((category) => [category.id, category] as const)),
    [categories],
  );

  const listItems = useMemo(
    () =>
      buildTransactionListItems({
        accounts,
        categories,
        splits: transactionSplits,
        transactions,
      }),
    [accounts, categories, transactionSplits, transactions],
  );

  const filteredItems = useMemo(
    () =>
      filterTransactionListItems(
        listItems,
        {
          accountId: accountFilterId,
          categoryId: categoryFilterId,
          cleared: clearedFilter,
          dateRange: dateRangeFilter,
          payeeSearch,
          selectedMonth,
        },
        categories,
      ),
    [
      accountFilterId,
      categories,
      categoryFilterId,
      clearedFilter,
      dateRangeFilter,
      listItems,
      payeeSearch,
      selectedMonth,
    ],
  );

  const transactionGroups = useMemo(
    () => groupTransactionListItems(filteredItems),
    [filteredItems],
  );

  function openTransaction(transactionId: string) {
    router.push({
      pathname: '/transaction/[id]',
      params: { id: transactionId },
    });
  }

  const hasFilters =
    accountFilterId ||
    categoryFilterId ||
    clearedFilter !== 'all' ||
    dateRangeFilter !== 'all' ||
    payeeSearch.trim().length > 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-24 pt-6"
      >
        <Text className="text-3xl font-semibold text-slate-950">
          Transactions
        </Text>
        <Text className="mt-2 text-base text-slate-600">
          Review spending, income, and account activity.
        </Text>
        <View className="mt-4">
          <Button onPress={() => router.push('/add-transaction')}>
            Add Transaction
          </Button>
        </View>

        <Card className="mt-6">
          <Text className="text-lg font-semibold text-slate-950">Filters</Text>

          <View className="mt-4 gap-4">
            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Search
              </Text>
              <Input
                onChangeText={setPayeeSearch}
                placeholder="Search payee"
                value={payeeSearch}
              />
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Date
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <FilterPill
                  isSelected={dateRangeFilter === 'all'}
                  label="All dates"
                  onPress={() => setDateRangeFilter('all')}
                />
                <FilterPill
                  isSelected={dateRangeFilter === 'selected_month'}
                  label={selectedMonth}
                  onPress={() => setDateRangeFilter('selected_month')}
                />
              </View>
              {dateRangeFilter === 'selected_month' ? (
                <View className="mt-3">
                  <MonthPicker
                    month={selectedMonth}
                    onMonthChange={setSelectedMonth}
                  />
                </View>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Account
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <FilterPill
                  isSelected={accountFilterId === null}
                  label="All accounts"
                  onPress={() => setAccountFilterId(null)}
                />
                {accounts.map((account) => (
                  <FilterPill
                    isSelected={accountFilterId === account.id}
                    key={account.id}
                    label={account.name}
                    onPress={() => setAccountFilterId(account.id)}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <FilterPill
                  isSelected={categoryFilterId === null}
                  label="All categories"
                  onPress={() => setCategoryFilterId(null)}
                />
                {categories.map((category) => (
                  <FilterPill
                    isSelected={categoryFilterId === category.id}
                    key={category.id}
                    label={getCategoryFilterLabel(category, categoriesById)}
                    onPress={() => setCategoryFilterId(category.id)}
                  />
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Status
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <FilterPill
                  isSelected={clearedFilter === 'all'}
                  label="All"
                  onPress={() => setClearedFilter('all')}
                />
                <FilterPill
                  isSelected={clearedFilter === 'cleared'}
                  label="Cleared"
                  onPress={() => setClearedFilter('cleared')}
                />
                <FilterPill
                  isSelected={clearedFilter === 'uncleared'}
                  label="Uncleared"
                  onPress={() => setClearedFilter('uncleared')}
                />
              </View>
            </View>
          </View>
        </Card>

        <View className="mt-6 gap-3">
          {transactionGroups.length === 0 ? (
            <Card>
              <Text className="text-base font-medium text-slate-950">
                {transactions.length === 0
                  ? 'No transactions yet'
                  : 'No matching transactions'}
              </Text>
              <Text className="mt-1 text-sm text-slate-600">
                {transactions.length === 0
                  ? 'Transactions will appear here after you add one.'
                  : 'Adjust filters or search to widen the list.'}
              </Text>
            </Card>
          ) : (
            <>
              <Text className="text-sm font-medium text-slate-600">
                Showing {filteredItems.length} of {listItems.length}
                {hasFilters ? ' matching transactions' : ' transactions'}
              </Text>
              {transactionGroups.map((group) => (
                <TransactionDateGroupCard
                  group={group}
                  key={group.dateKey}
                  onTransactionPress={openTransaction}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
