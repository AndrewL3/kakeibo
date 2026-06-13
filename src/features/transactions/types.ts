import type {
  Account,
  Category,
  Transaction,
  TransactionSplit,
} from '@/db/models';
import type { CurrencyCode, MoneyAmount, MonthString } from '@/lib';

export interface TransactionFormValues {
  accountId: string | null;
  amount: string;
  cleared: boolean;
  date: string;
  isTransfer: boolean;
  notes: string;
  payee: string;
  splits: TransactionSplitFormValues[];
  transferAccountId: string | null;
}

export interface TransactionSplitFormValues {
  amount: string;
  categoryId: string | null;
  id: string | null;
  notes: string;
}

export interface TransactionInput {
  accountId: string;
  amount: MoneyAmount;
  cleared: boolean;
  date: Date;
  isTransfer: boolean;
  notes: string | null;
  payee: string | null;
  splits: TransactionSplitInput[];
  transferAccountId: string | null;
}

export interface TransactionSplitInput {
  amount: MoneyAmount;
  categoryId: string;
  id: string | null;
  notes: string | null;
}

export type TransactionFormErrorKey =
  | Exclude<keyof TransactionFormValues, 'splits'>
  | 'form'
  | 'splits';

export interface TransactionSplitFormErrors {
  amount?: string;
  categoryId?: string;
  notes?: string;
}

export type TransactionFormErrors = Partial<
  Record<TransactionFormErrorKey, string>
> & {
  splitRows?: Record<number, TransactionSplitFormErrors>;
};

export interface TransactionValidationContext {
  accounts: ReadonlyArray<Account>;
  categories: ReadonlyArray<Category>;
}

export interface TransactionValidationResult {
  data: TransactionInput | null;
  errors: TransactionFormErrors;
}

export interface TransactionEditorData {
  splits: TransactionSplit[];
  transaction: Transaction;
}

export type ClearedFilter = 'all' | 'cleared' | 'uncleared';

export type DateRangeFilter = 'all' | 'selected_month';

export interface TransactionFilters {
  accountId: string | null;
  categoryId: string | null;
  cleared: ClearedFilter;
  dateRange: DateRangeFilter;
  payeeSearch: string;
  selectedMonth: MonthString;
}

export interface TransactionListSources {
  accounts: ReadonlyArray<Account>;
  categories: ReadonlyArray<Category>;
  splits: ReadonlyArray<TransactionSplit>;
  transactions: ReadonlyArray<Transaction>;
}

export interface TransactionListItem {
  id: string;
  accountId: string;
  accountName: string;
  amount: MoneyAmount;
  categoryIds: string[];
  categoryLabel: string;
  currency: CurrencyCode;
  date: Date;
  dateKey: string;
  isCleared: boolean;
  isTransfer: boolean;
  notes: string | null;
  payee: string;
  transferAccountId: string | null;
  transferAccountName: string | null;
}

export interface TransactionDateGroup {
  dateKey: string;
  dateLabel: string;
  transactions: TransactionListItem[];
}
