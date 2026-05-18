import type { AccountType, BudgetType, CurrencyCode } from './types';

export const DEFAULT_CURRENCY: CurrencyCode = 'TWD';

export const ACCOUNT_TYPES: ReadonlyArray<{ label: string; value: AccountType }> = [
  { label: 'Chequing', value: 'chequing' },
  { label: 'Savings', value: 'savings' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Cash', value: 'cash' },
];

export const BUDGET_TYPES: ReadonlyArray<{ label: string; value: BudgetType }> = [
  { label: 'Need', value: 'need' },
  { label: 'Want', value: 'want' },
  { label: 'Savings', value: 'savings' },
];

export const MONTH_FORMAT = 'yyyy-MM';

export const MIN_TOUCH_TARGET_SIZE = 44;
