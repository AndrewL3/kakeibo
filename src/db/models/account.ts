import { Model } from '@nozbe/watermelondb';
import { date, field, readonly } from '@nozbe/watermelondb/decorators';

import type { AccountType, CurrencyCode, MoneyAmount } from '@/lib';

export class Account extends Model {
  static table = 'accounts';

  @field('name') name!: string;
  @field('type') type!: AccountType;
  @field('balance') balance!: MoneyAmount;
  @field('currency') currency!: CurrencyCode;
  @field('is_active') isActive!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
}
