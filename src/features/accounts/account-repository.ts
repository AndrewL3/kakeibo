import { Q } from '@nozbe/watermelondb';

import { database } from '@/db/database';
import { Account } from '@/db/models';

import type { AccountInput } from './types';

const accountsCollection = database.get<Account>('accounts');

export function observeActiveAccounts() {
  return accountsCollection
    .query(Q.where('is_active', true), Q.sortBy('created_at', Q.desc))
    .observe();
}

export async function createAccount(input: AccountInput): Promise<Account> {
  return database.write(async () => {
    return accountsCollection.create((account) => {
      account.name = input.name;
      account.type = input.type;
      account.balance = input.balance;
      account.currency = input.currency;
      account.isActive = true;
    });
  });
}

export async function updateAccount(
  accountId: string,
  input: AccountInput,
): Promise<Account> {
  return database.write(async () => {
    const account = await accountsCollection.find(accountId);

    return account.update((record) => {
      record.name = input.name;
      record.type = input.type;
      record.balance = input.balance;
      record.currency = input.currency;
      record.updatedAt = new Date();
    });
  });
}
