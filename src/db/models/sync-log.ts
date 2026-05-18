import { Model } from '@nozbe/watermelondb';
import { date, field } from '@nozbe/watermelondb/decorators';

import type { SyncTableName } from '@/lib';

export class SyncLog extends Model {
  static table = 'sync_log';

  @field('table_name') tableName!: SyncTableName;
  @date('last_pulled_at') lastPulledAt!: Date;
  @date('last_pushed_at') lastPushedAt!: Date;
}
