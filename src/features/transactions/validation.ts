import { parseMoneyInput } from '@/lib';

import type {
  TransactionFormErrors,
  TransactionFormValues,
  TransactionSplitInput,
  TransactionValidationContext,
  TransactionValidationResult,
} from './types';

function parseDateInput(input: string): Date | null {
  const normalizedInput = input.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedInput);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getTodayDateInput(): string {
  return formatDateInput(new Date());
}

export function validateTransactionForm(
  values: TransactionFormValues,
  context: TransactionValidationContext,
): TransactionValidationResult {
  const errors: TransactionFormErrors = {};
  const splitRowErrors: NonNullable<TransactionFormErrors['splitRows']> = {};
  const account = values.accountId
    ? context.accounts.find((item) => item.id === values.accountId)
    : null;
  const transferAccount = values.transferAccountId
    ? context.accounts.find((item) => item.id === values.transferAccountId)
    : null;
  const payee = values.payee.trim();
  const notes = values.notes.trim();
  const date = parseDateInput(values.date);
  const amount = account
    ? parseMoneyInput(values.amount, account.currency)
    : null;
  const splitInputs: TransactionSplitInput[] = [];
  let splitTotal = 0;

  if (!account) {
    errors.accountId = 'Choose an account.';
  }

  if (!date) {
    errors.date = 'Enter a valid date as YYYY-MM-DD.';
  }

  if (amount === null) {
    errors.amount =
      account?.currency === 'CAD'
        ? 'Enter a CAD amount with up to 2 decimal places.'
        : 'Enter a whole-number TWD amount.';
  } else if (amount === 0) {
    errors.amount = 'Amount cannot be zero.';
  }

  if (values.isTransfer) {
    if (!transferAccount) {
      errors.transferAccountId = 'Choose a destination account.';
    } else if (account && transferAccount.id === account.id) {
      errors.transferAccountId = 'Choose a different account.';
    } else if (account && transferAccount.currency !== account.currency) {
      errors.transferAccountId =
        'Choose an account with the same currency for now.';
    }
  } else {
    if (values.splits.length === 0) {
      errors.splits = 'Add at least one split.';
    }

    values.splits.forEach((split, index) => {
      const rowErrors = splitRowErrors[index] ?? {};
      const category = split.categoryId
        ? context.categories.find((item) => item.id === split.categoryId)
        : null;
      const splitAmount = account
        ? parseMoneyInput(split.amount, account.currency)
        : null;
      const splitNotes = split.notes.trim();

      if (!category) {
        rowErrors.categoryId = 'Choose a category.';
      }

      if (splitAmount === null) {
        rowErrors.amount =
          account?.currency === 'CAD'
            ? 'Enter a CAD amount with up to 2 decimal places.'
            : 'Enter a whole-number TWD amount.';
      } else if (splitAmount === 0) {
        rowErrors.amount = 'Split amount cannot be zero.';
      }

      if (
        Object.keys(rowErrors).length > 0 ||
        !category ||
        splitAmount === null
      ) {
        splitRowErrors[index] = rowErrors;
        return;
      }

      splitTotal += splitAmount;
      splitInputs.push({
        amount: splitAmount,
        categoryId: category.id,
        id: split.id,
        notes: splitNotes.length > 0 ? splitNotes : null,
      });
    });

    if (
      amount !== null &&
      values.splits.length > 0 &&
      splitInputs.length === values.splits.length &&
      splitTotal !== amount
    ) {
      errors.splits = 'Split amounts must sum to the transaction amount.';
    }

    if (Object.keys(splitRowErrors).length > 0) {
      errors.splitRows = splitRowErrors;
    }
  }

  if (Object.keys(errors).length > 0 || !account || !date || amount === null) {
    return { data: null, errors };
  }

  return {
    data: {
      accountId: account.id,
      amount,
      cleared: values.cleared,
      date,
      isTransfer: values.isTransfer,
      notes: notes.length > 0 ? notes : null,
      payee: payee.length > 0 ? payee : null,
      splits: splitInputs,
      transferAccountId: values.isTransfer
        ? (transferAccount?.id ?? null)
        : null,
    },
    errors: {},
  };
}
