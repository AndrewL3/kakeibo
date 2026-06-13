import { Q } from '@nozbe/watermelondb';

import { database } from '@/db/database';
import { Transaction, TransactionSplit } from '@/db/models';

import type { TransactionEditorData, TransactionInput } from './types';

const transactionsCollection = database.get<Transaction>('transactions');
const transactionSplitsCollection =
  database.get<TransactionSplit>('transaction_splits');

export function observeTransactions() {
  return transactionsCollection
    .query(Q.sortBy('date', Q.desc), Q.sortBy('created_at', Q.desc))
    .observe();
}

export function observeTransactionSplits() {
  return transactionSplitsCollection.query().observe();
}

export async function fetchTransactionEditorData(
  transactionId: string,
): Promise<TransactionEditorData> {
  const transaction = await transactionsCollection.find(transactionId);
  const splits = await transactionSplitsCollection
    .query(Q.where('transaction_id', transactionId))
    .fetch();

  return {
    splits,
    transaction,
  };
}

export async function createTransactionWithSplits(
  input: TransactionInput,
): Promise<Transaction> {
  return database.write(async () => {
    const transaction = await transactionsCollection.create((record) => {
      record.accountId = input.accountId;
      record.amount = input.amount;
      record.cleared = input.cleared;
      record.date = input.date;
      record.isTransfer = input.isTransfer;
      record.notes = input.notes;
      record.payee = input.payee;
      record.transferAccountId = input.transferAccountId;
    });

    for (const split of input.isTransfer ? [] : input.splits) {
      await transactionSplitsCollection.create((record) => {
        record.amount = split.amount;
        record.categoryId = split.categoryId;
        record.notes = split.notes;
        record.transactionId = transaction.id;
      });
    }

    return transaction;
  });
}

export async function updateTransactionWithSplits(
  transactionId: string,
  input: TransactionInput,
): Promise<Transaction> {
  return database.write(async () => {
    const transaction = await transactionsCollection.find(transactionId);
    const splits = await transactionSplitsCollection
      .query(Q.where('transaction_id', transactionId))
      .fetch();

    await transaction.update((record) => {
      record.accountId = input.accountId;
      record.amount = input.amount;
      record.cleared = input.cleared;
      record.date = input.date;
      record.isTransfer = input.isTransfer;
      record.notes = input.notes;
      record.payee = input.payee;
      record.transferAccountId = input.transferAccountId;
    });

    if (input.isTransfer) {
      for (const existingSplit of splits) {
        await existingSplit.markAsDeleted();
      }

      return transaction;
    }

    const existingSplitsById = new Map(
      splits.map((split) => [split.id, split] as const),
    );
    const incomingSplitIds = new Set(
      input.splits
        .map((split) => split.id)
        .filter((splitId): splitId is string => Boolean(splitId)),
    );

    for (const existingSplit of splits) {
      if (!incomingSplitIds.has(existingSplit.id)) {
        await existingSplit.markAsDeleted();
      }
    }

    for (const split of input.splits) {
      const existingSplit = split.id ? existingSplitsById.get(split.id) : null;

      if (existingSplit) {
        await existingSplit.update((record) => {
          record.amount = split.amount;
          record.categoryId = split.categoryId;
          record.notes = split.notes;
        });
      } else {
        await transactionSplitsCollection.create((record) => {
          record.amount = split.amount;
          record.categoryId = split.categoryId;
          record.notes = split.notes;
          record.transactionId = transaction.id;
        });
      }
    }

    return transaction;
  });
}
