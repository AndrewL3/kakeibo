import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import {
  Account,
  Category,
  CategoryBudget,
  RecurringTemplate,
  SyncLog,
  Transaction,
  TransactionSplit,
} from './models';
import { schema } from './schema';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'kakeibo',
  jsi: true,
  onSetUpError: (error) => {
    console.error('Failed to set up WatermelonDB', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Account,
    Category,
    CategoryBudget,
    Transaction,
    TransactionSplit,
    RecurringTemplate,
    SyncLog,
  ],
});

