import { Model } from '@nozbe/watermelondb';
import { date, field } from '@nozbe/watermelondb/decorators';

import type { MoneyAmount } from '@/lib';

export class RecurringTemplate extends Model {
  static table = 'recurring_templates';

  @field('account_id') accountId!: string;
  @field('category_id') categoryId?: string;
  @field('payee') payee!: string;
  @field('amount') amount!: MoneyAmount;
  @field('rrule') rrule!: string;
  @date('next_due_date') nextDueDate!: Date;
  @field('is_active') isActive!: boolean;
}
