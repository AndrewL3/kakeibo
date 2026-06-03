import AsyncStorage from '@react-native-async-storage/async-storage';

type LoadDatabaseCallback = (database?: string | null | Error) => void;
type SaveDatabaseCallback = (error?: Error | null) => void;

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error(String(error));
};

export class LokiAsyncStorageAdapter {
  private storageKey(dbName: string): string {
    return `loki:${dbName}`;
  }

  loadDatabase(dbName: string, callback: LoadDatabaseCallback): void {
    AsyncStorage.getItem(this.storageKey(dbName))
      .then((database) => callback(database))
      .catch((error: unknown) => callback(toError(error)));
  }

  saveDatabase(
    dbName: string,
    database: string,
    callback: SaveDatabaseCallback,
  ): void {
    AsyncStorage.setItem(this.storageKey(dbName), database)
      .then(() => callback())
      .catch((error: unknown) => callback(toError(error)));
  }

  deleteDatabase(dbName: string, callback?: SaveDatabaseCallback): void {
    AsyncStorage.removeItem(this.storageKey(dbName))
      .then(() => callback?.())
      .catch((error: unknown) => callback?.(toError(error)));
  }
}
