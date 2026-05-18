import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

import type { MoneyAmount } from '@/lib';

export class TransactionSplit extends Model {
  static table = 'transaction_splits';

  @field('transaction_id') transactionId!: string;
  @field('category_id') categoryId!: string;
  @field('amount') amount!: MoneyAmount;
  @field('notes') notes?: string;
}
