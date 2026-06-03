import type { AccountType, CurrencyCode, MoneyAmount } from '@/lib';

export interface AccountFormValues {
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: string;
}

export interface AccountInput {
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: MoneyAmount;
}

export type AccountFormErrorKey = keyof AccountFormValues | 'form';

export type AccountFormErrors = Partial<Record<AccountFormErrorKey, string>>;

export interface AccountValidationResult {
  data: AccountInput | null;
  errors: AccountFormErrors;
}
