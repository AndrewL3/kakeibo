import { database } from './database';

export interface SyncResult {
  syncedAt: Date;
  pushed: boolean;
  pulled: boolean;
}

export async function synchronizeDatabase(): Promise<SyncResult> {
  await database.write(async () => undefined);

  return {
    syncedAt: new Date(),
    pushed: false,
    pulled: false,
  };
}
