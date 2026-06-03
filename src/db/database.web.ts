import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

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

const adapter = new LokiJSAdapter({
  schema,
  dbName: 'kakeibo-web',
  useWebWorker: false,
  useIncrementalIndexedDB: true,
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
