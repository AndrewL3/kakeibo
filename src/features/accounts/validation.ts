import { ACCOUNT_TYPES, SUPPORTED_CURRENCIES } from '@/lib/constants';
import { parseMoneyInput } from '@/lib/money';
import type { AccountType, CurrencyCode } from '@/lib';

import type {
  AccountFormErrors,
  AccountFormValues,
  AccountValidationResult,
} from './types';

const accountTypeValues = ACCOUNT_TYPES.map(({ value }) => value);
const currencyValues = SUPPORTED_CURRENCIES.map(({ value }) => value);

export { formatMoneyInput, parseMoneyInput } from '@/lib/money';

function isAccountType(value: string): value is AccountType {
  return accountTypeValues.includes(value as AccountType);
}

function isCurrencyCode(value: string): value is CurrencyCode {
  return currencyValues.includes(value as CurrencyCode);
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
