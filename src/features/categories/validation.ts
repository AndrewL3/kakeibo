import { BUDGET_TYPES } from '@/lib/constants';
import type { BudgetType } from '@/lib';

import type {
  CategoryFormErrors,
  CategoryFormValues,
  CategoryValidationContext,
  CategoryValidationResult,
} from './types';

const budgetTypeValues = BUDGET_TYPES.map(({ value }) => value);

function isBudgetType(value: string): value is BudgetType {
  return budgetTypeValues.includes(value as BudgetType);
}

function parseSortOrder(input: string): number | null {
  const normalizedInput = input.trim();

  if (!/^\d+$/.test(normalizedInput)) {
    return null;
  }

  const sortOrder = Number(normalizedInput);

  return Number.isSafeInteger(sortOrder) ? sortOrder : null;
}

export function validateCategoryForm(
  values: CategoryFormValues,
  context: CategoryValidationContext,
): CategoryValidationResult {
  const errors: CategoryFormErrors = {};
  const name = values.name.trim();
  const icon = values.icon.trim();
  const parentId = values.parentId;
  const editingCategoryId = context.editingCategoryId;
  const selectedParent = parentId
    ? context.categories.find((category) => category.id === parentId)
    : null;
  const editingCategoryHasChildren = editingCategoryId
    ? context.categories.some(
        (category) => category.parentId === editingCategoryId,
      )
    : false;

  if (name.length === 0) {
    errors.name = 'Category name is required.';
  }

  if (!isBudgetType(values.budgetType)) {
    errors.budgetType = 'Choose a valid budget type.';
  }

  if (parentId && parentId === editingCategoryId) {
    errors.parentId = 'A category cannot be its own parent.';
  } else if (parentId && !selectedParent) {
    errors.parentId = 'Choose a valid parent category.';
  } else if (selectedParent?.parentId) {
    errors.parentId = 'Choose a top-level parent category.';
  } else if (parentId && editingCategoryHasChildren) {
    errors.parentId = 'A category with children must stay top-level.';
  }

  if (icon.length > 12) {
    errors.icon = 'Use a shorter icon label.';
  }

  const sortOrder = parseSortOrder(values.sortOrder);

  if (sortOrder === null) {
    errors.sortOrder = 'Enter a whole-number sort order.';
  }

  if (Object.keys(errors).length > 0 || sortOrder === null) {
    return { data: null, errors };
  }

  return {
    data: {
      name,
      parentId,
      budgetType: values.budgetType,
      icon: icon.length > 0 ? icon : null,
      sortOrder,
    },
    errors: {},
  };
}
