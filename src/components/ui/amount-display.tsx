import { Text } from 'react-native';

import type { CurrencyCode, MoneyAmount } from '@/lib';

interface AmountDisplayProps {
  amount: MoneyAmount;
  currency?: CurrencyCode;
  className?: string;
  showSign?: boolean;
}

const currencyLocales: Record<CurrencyCode, string> = {
  TWD: 'zh-TW',
  CAD: 'en-CA',
};

const currencyDivisors: Record<CurrencyCode, number> = {
  TWD: 1,
  CAD: 100,
};

export function AmountDisplay({ amount, className, currency = 'TWD', showSign = false }:
  AmountDisplayProps) {
  const formattedAmount = new Intl.NumberFormat(currencyLocales[currency], {
    currency,
    style: 'currency',
  }).format(amount / currencyDivisors[currency]);

  const sign = showSign && amount > 0 ? '+' : '';

  return <Text className={`font-semibold ${className ?? ''}`}>{sign}{formattedAmount}</Text>;
}
