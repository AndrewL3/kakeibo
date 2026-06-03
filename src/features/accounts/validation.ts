import { ACCOUNT_TYPES, SUPPORTED_CURRENCIES } from '@/lib/constants';
import type { AccountType, CurrencyCode, MoneyAmount } from '@/lib';

import type {
  AccountFormErrors,
  AccountFormValues,
  AccountValidationResult,
} from './types';

const accountTypeValues = ACCOUNT_TYPES.map(({ value }) => value);
const currencyValues = SUPPORTED_CURRENCIES.map(({ value }) => value);

function isAccountType(value: string): value is AccountType {
  return accountTypeValues.includes(value as AccountType);
}

function isCurrencyCode(value: string): value is CurrencyCode {
  return currencyValues.includes(value as CurrencyCode);
}

function isSafeStorageAmount(value: number): value is MoneyAmount {
  return Number.isSafeInteger(value);
}

export function parseMoneyInput(
  input: string,
  currency: CurrencyCode,
): MoneyAmount | null {
  const normalizedInput = input.trim().replaceAll(',', '');

  if (normalizedInput.length === 0) {
    return null;
  }

  if (currency === 'TWD') {
    if (!/^-?\d+$/.test(normalizedInput)) {
      return null;
    }

    const parsedAmount = Number(normalizedInput);

    return isSafeStorageAmount(parsedAmount) ? parsedAmount : null;
  }

  if (!/^-?\d+(\.\d{1,2})?$/.test(normalizedInput)) {
    return null;
  }

  const isNegative = normalizedInput.startsWith('-');
  const unsignedInput = isNegative ? normalizedInput.slice(1) : normalizedInput;
  const [dollars, cents = ''] = unsignedInput.split('.');
  const parsedAmount = Number(dollars) * 100 + Number(cents.padEnd(2, '0'));
  const signedAmount = isNegative ? -parsedAmount : parsedAmount;

  return isSafeStorageAmount(signedAmount) ? signedAmount : null;
}

export function formatMoneyInput(
  amount: MoneyAmount,
  currency: CurrencyCode,
): string {
  if (currency === 'TWD') {
    return String(amount);
  }

  const sign = amount < 0 ? '-' : '';
  const absoluteAmount = Math.abs(amount);
  const dollars = Math.floor(absoluteAmount / 100);
  const cents = String(absoluteAmount % 100).padStart(2, '0');

  return `${sign}${dollars}.${cents}`;
}

export function validateAccountForm(
  values: AccountFormValues,
): AccountValidationResult {
  const errors: AccountFormErrors = {};
  const name = values.name.trim();

  if (name.length === 0) {
    errors.name = 'Account name is required.';
  }

  if (!isAccountType(values.type)) {
    errors.type = 'Choose a valid account type.';
  }

  if (!isCurrencyCode(values.currency)) {
    errors.currency = 'Choose a supported currency.';
  }

  const balance = parseMoneyInput(values.balance, values.currency);

  if (balance === null) {
    errors.balance =
      values.currency === 'TWD'
        ? 'Enter a whole-number TWD amount.'
        : 'Enter a CAD amount with up to 2 decimal places.';
  }

  if (Object.keys(errors).length > 0 || balance === null) {
    return { data: null, errors };
  }

  return {
    data: {
      name,
      type: values.type,
      currency: values.currency,
      balance,
    },
    errors: {},
  };
}
