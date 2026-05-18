import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

import type { BudgetType } from '@/lib';

export class Category extends Model {
  static table = 'categories';

  @field('name') name!: string;
  @field('parent_id') parentId?: string;
  @field('budget_type') budgetType!: BudgetType;
  @field('icon') icon?: string;
  @field('sort_order') sortOrder!: number;
  @field('is_active') isActive!: boolean;
}

