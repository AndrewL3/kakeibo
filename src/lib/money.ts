import type { CurrencyCode, MoneyAmount } from './types';

export const CURRENCY_DIVISORS: Record<CurrencyCode, number> = {
  TWD: 1,
  CAD: 100,
};

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
