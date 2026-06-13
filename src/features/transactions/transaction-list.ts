import type { Account, Category, TransactionSplit } from '@/db/models';
import { DEFAULT_CURRENCY } from '@/lib';
import type { CurrencyCode } from '@/lib';

import type {
  TransactionDateGroup,
  TransactionFilters,
  TransactionListItem,
  TransactionListSources,
} from './types';

const dateHeadingFormatter = new Intl.DateTimeFormat('en-CA', {
  day: 'numeric',
  month: 'short',
  weekday: 'short',
  year: 'numeric',
});

function padDatePart(value: number): string {
  return String(value).padStart(2, '0');
}

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());

  return `${year}-${month}-${day}`;
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);

  return `${year}-${month}`;
}

function getCategoryName(
  category: Category | undefined,
  categoriesById: ReadonlyMap<string, Category>,
): string {
  if (!category) {
    return 'Uncategorized';
  }

  if (!category.parentId) {
    return category.name;
  }

  const parentCategory = categoriesById.get(category.parentId);

  return parentCategory
    ? `${parentCategory.name} / ${category.name}`
    : category.name;
}

function getCategoryFilterIds(
  categoryId: string,
  categories: ReadonlyArray<Category>,
): Set<string> {
  const categoryIds = new Set<string>([categoryId]);

  categories.forEach((category) => {
    if (category.parentId === categoryId) {
      categoryIds.add(category.id);
    }
  });

  return categoryIds;
}

function getTransactionCategoryLabel(
  transactionSplits: ReadonlyArray<TransactionSplit>,
  categoriesById: ReadonlyMap<string, Category>,
  isTransfer: boolean,
): string {
  if (isTransfer) {
    return 'Transfer';
  }

  if (transactionSplits.length > 1) {
    return 'Split';
  }

  const categoryIds = Array.from(
    new Set(transactionSplits.map((split) => split.categoryId)),
  );

  if (categoryIds.length === 0) {
    return 'Uncategorized';
  }

  return getCategoryName(categoriesById.get(categoryIds[0]), categoriesById);
}

function getAccountCurrency(account: Account | undefined): CurrencyCode {
  return account?.currency ?? DEFAULT_CURRENCY;
}

export function getCategoryFilterLabel(
  category: Category,
  categoriesById: ReadonlyMap<string, Category>,
): string {
  return getCategoryName(category, categoriesById);
}

export function buildTransactionListItems({
  accounts,
  categories,
  splits,
  transactions,
}: TransactionListSources): TransactionListItem[] {
  const accountsById = new Map(
    accounts.map((account) => [account.id, account] as const),
  );
  const categoriesById = new Map(
    categories.map((category) => [category.id, category] as const),
  );
  const splitsByTransactionId = new Map<string, TransactionSplit[]>();

  splits.forEach((split) => {
    const existingSplits = splitsByTransactionId.get(split.transactionId) ?? [];
    splitsByTransactionId.set(split.transactionId, [...existingSplits, split]);
  });

  return transactions.map((transaction) => {
    const account = accountsById.get(transaction.accountId);
    const transferAccount = transaction.transferAccountId
      ? accountsById.get(transaction.transferAccountId)
      : undefined;
    const transactionSplits = splitsByTransactionId.get(transaction.id) ?? [];
    const payee = transaction.payee?.trim();

    return {
      id: transaction.id,
      accountId: transaction.accountId,
      accountName: account?.name ?? 'Unknown account',
      amount: transaction.amount,
      categoryIds: transactionSplits.map((split) => split.categoryId),
      categoryLabel: getTransactionCategoryLabel(
        transactionSplits,
        categoriesById,
        transaction.isTransfer,
      ),
      currency: getAccountCurrency(account),
      date: transaction.date,
      dateKey: getDateKey(transaction.date),
      isCleared: transaction.cleared,
      isTransfer: transaction.isTransfer,
      notes: transaction.notes ?? null,
      payee:
        payee && payee.length > 0
          ? payee
          : transaction.isTransfer
            ? 'Transfer'
            : 'Untitled transaction',
      transferAccountId: transaction.transferAccountId,
      transferAccountName: transferAccount?.name ?? null,
    };
  });
}

export function filterTransactionListItems(
  items: ReadonlyArray<TransactionListItem>,
  filters: TransactionFilters,
  categories: ReadonlyArray<Category>,
): TransactionListItem[] {
  const normalizedSearch = filters.payeeSearch.trim().toLowerCase();
  const categoryFilterIds = filters.categoryId
    ? getCategoryFilterIds(filters.categoryId, categories)
    : null;

  return items.filter((item) => {
    if (filters.accountId && item.accountId !== filters.accountId) {
      return false;
    }

    if (
      categoryFilterIds &&
      !item.categoryIds.some((categoryId) => categoryFilterIds.has(categoryId))
    ) {
      return false;
    }

    if (filters.cleared === 'cleared' && !item.isCleared) {
      return false;
    }

    if (filters.cleared === 'uncleared' && item.isCleared) {
      return false;
    }

    if (
      filters.dateRange === 'selected_month' &&
      getMonthKey(item.date) !== filters.selectedMonth
    ) {
      return false;
    }

    if (
      normalizedSearch.length > 0 &&
      !item.payee.toLowerCase().includes(normalizedSearch)
    ) {
      return false;
    }

    return true;
  });
}

export function groupTransactionListItems(
  items: ReadonlyArray<TransactionListItem>,
): TransactionDateGroup[] {
  const groupsByDateKey = new Map<string, TransactionListItem[]>();

  items.forEach((item) => {
    const existingItems = groupsByDateKey.get(item.dateKey) ?? [];
    groupsByDateKey.set(item.dateKey, [...existingItems, item]);
  });

  return Array.from(groupsByDateKey.entries()).map(([dateKey, groupItems]) => ({
    dateKey,
    dateLabel: dateHeadingFormatter.format(groupItems[0].date),
    transactions: groupItems,
  }));
}
