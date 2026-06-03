import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { LokiAsyncStorageAdapter } from './loki-async-storage-adapter';
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

const onSetUpError = (error: Error) => {
  console.error('Failed to set up WatermelonDB', error);
};

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const adapter = isExpoGo
  ? new LokiJSAdapter({
      schema,
      dbName: 'kakeibo-expo-go',
      useWebWorker: false,
      useIncrementalIndexedDB: false,
      extraLokiOptions: {
        autosaveInterval: 100,
      },
      _testLokiAdapter: new LokiAsyncStorageAdapter(),
      onSetUpError,
    })
  : new SQLiteAdapter({
      schema,
      dbName: 'kakeibo',
      jsi: true,
      onSetUpError,
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
