import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

import type { MoneyAmount, MonthString } from '@/lib';

export class CategoryBudget extends Model {
  static table = 'category_budgets';

  @field('category_id') categoryId!: string;
  @field('month') month!: MonthString;
  @field('allocated_amount') allocatedAmount!: MoneyAmount;
}
