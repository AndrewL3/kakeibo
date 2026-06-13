import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

import type { MoneyAmount } from '@/lib';

export class Transaction extends Model {
  static table = 'transactions';

  @field('account_id') accountId!: string;
  @date('date') date!: Date;
  @field('amount') amount!: MoneyAmount;
  @field('payee') payee!: string | null;
  @field('notes') notes!: string | null;
  @field('cleared') cleared!: boolean;
  @field('is_transfer') isTransfer!: boolean;
  @field('transfer_account_id') transferAccountId!: string | null;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
