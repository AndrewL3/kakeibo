import { Q } from '@nozbe/watermelondb';

import { database } from '@/db/database';
import { Category } from '@/db/models';

import type { CategoryInput } from './types';

const categoriesCollection = database.get<Category>('categories');

export function observeActiveCategories() {
  return categoriesCollection
    .query(Q.where('is_active', true), Q.sortBy('sort_order'), Q.sortBy('name'))
    .observe();
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return database.write(async () => {
    return categoriesCollection.create((category) => {
      category.name = input.name;
      category.parentId = input.parentId;
      category.budgetType = input.budgetType;
      category.icon = input.icon;
      category.sortOrder = input.sortOrder;
      category.isActive = true;
    });
  });
}

export async function updateCategory(
  categoryId: string,
  input: CategoryInput,
): Promise<Category> {
  return database.write(async () => {
    const category = await categoriesCollection.find(categoryId);

    return category.update((record) => {
      record.name = input.name;
      record.parentId = input.parentId;
      record.budgetType = input.budgetType;
      record.icon = input.icon;
      record.sortOrder = input.sortOrder;
    });
  });
}
