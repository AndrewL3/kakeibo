import type { BudgetType } from '@/lib';

export interface CategoryFormValues {
  name: string;
  parentId: string | null;
  budgetType: BudgetType;
  icon: string;
  sortOrder: string;
}

export interface CategoryInput {
  name: string;
  parentId: string | null;
  budgetType: BudgetType;
  icon: string | null;
  sortOrder: number;
}

export interface CategoryOption {
  id: string;
  name: string;
  parentId: string | null;
}

export interface CategoryValidationContext {
  categories: ReadonlyArray<CategoryOption>;
  editingCategoryId: string | null;
}

export type CategoryFormErrorKey = keyof CategoryFormValues | 'form';

export type CategoryFormErrors = Partial<Record<CategoryFormErrorKey, string>>;

export interface CategoryValidationResult {
  data: CategoryInput | null;
  errors: CategoryFormErrors;
}
