export type AccountType = 'chequing' | 'savings' | 'credit_card' | 'cash';

export type BudgetType = 'need' | 'want' | 'savings';

export type CurrencyCode = 'TWD' | 'CAD';

export type ISODateString = string;

export type MonthString = `${number}-${string}`;

export type MoneyAmount = number;

export type TransactionStatus = 'pending' | 'cleared';

export type SyncTableName =
  | 'accounts'
  | 'categories'
  | 'category_budgets'
  | 'transactions'
  | 'transaction_splits'
  | 'recurring_templates';

export interface MonthlyBudgetSummary {
  month: MonthString;
  incomeAmount: MoneyAmount;
  allocatedAmount: MoneyAmount;
  spentAmount: MoneyAmount;
  toBeBudgetedAmount: MoneyAmount;
}
