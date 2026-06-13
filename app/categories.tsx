import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Input } from '@/components/ui';
import type { Category } from '@/db/models';
import {
  createCategory,
  observeActiveCategories,
  updateCategory,
  validateCategoryForm,
} from '@/features/categories';
import type {
  CategoryFormErrors,
  CategoryFormValues,
  CategoryOption,
} from '@/features/categories';
import { BUDGET_TYPES } from '@/lib';
import type { BudgetType } from '@/lib';

const emptyFormValues: CategoryFormValues = {
  name: '',
  parentId: null,
  budgetType: 'need',
  icon: '',
  sortOrder: '0',
};

const budgetTypeBadgeClassNames: Record<BudgetType, string> = {
  need: 'bg-sky-100',
  want: 'bg-amber-100',
  savings: 'bg-emerald-100',
};

const budgetTypeTextClassNames: Record<BudgetType, string> = {
  need: 'text-sky-800',
  want: 'text-amber-800',
  savings: 'text-emerald-800',
};

function getBudgetTypeLabel(type: BudgetType): string {
  return BUDGET_TYPES.find((option) => option.value === type)?.label ?? type;
}

function getNextSortOrder(categories: ReadonlyArray<Category>): string {
  if (categories.length === 0) {
    return '0';
  }

  const highestSortOrder = Math.max(
    ...categories.map((category) => category.sortOrder),
  );

  return String(highestSortOrder + 1);
}

function toCategoryOptions(
  categories: ReadonlyArray<Category>,
): CategoryOption[] {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    parentId: category.parentId,
  }));
}

interface CategoryRowProps {
  category: Category;
  isChild?: boolean;
  onEdit: (category: Category) => void;
}

const CategoryRow = memo(function CategoryRow({
  category,
  isChild = false,
  onEdit,
}: CategoryRowProps) {
  return (
    <View
      className={`gap-3 border-slate-100 py-3 ${
        isChild ? 'border-t pl-5' : ''
      }`}
    >
      <View className="min-w-0 flex-row items-start gap-3">
        <View className="min-h-10 min-w-10 items-center justify-center rounded-md bg-slate-100 px-2">
          <Text className="text-base font-semibold text-slate-700">
            {category.icon ?? '#'}
          </Text>
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-base font-semibold text-slate-950">
            {category.name}
          </Text>
          <View className="mt-2 flex-row flex-wrap items-center gap-2">
            <View
              className={`rounded-md px-2 py-1 ${
                budgetTypeBadgeClassNames[category.budgetType]
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  budgetTypeTextClassNames[category.budgetType]
                }`}
              >
                {getBudgetTypeLabel(category.budgetType)}
              </Text>
            </View>
            <Text className="text-xs text-slate-500">
              Sort {category.sortOrder}
            </Text>
          </View>
        </View>
      </View>

      <View className="items-start">
        <Button
          accessibilityLabel={`Edit ${category.name}`}
          onPress={() => onEdit(category)}
          variant="secondary"
        >
          Edit
        </Button>
      </View>
    </View>
  );
});

interface CategoryGroupCardProps {
  category: Category;
  childCategories: Category[];
  onEdit: (category: Category) => void;
}

const CategoryGroupCard = memo(function CategoryGroupCard({
  category,
  childCategories,
  onEdit,
}: CategoryGroupCardProps) {
  return (
    <Card>
      <CategoryRow category={category} onEdit={onEdit} />
      {childCategories.map((childCategory) => (
        <CategoryRow
          category={childCategory}
          isChild
          key={childCategory.id}
          onEdit={onEdit}
        />
      ))}
    </Card>
  );
});

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formValues, setFormValues] =
    useState<CategoryFormValues>(emptyFormValues);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const subscription = observeActiveCategories().subscribe(setCategories);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const categoryOptions = useMemo(
    () => toCategoryOptions(categories),
    [categories],
  );

  const editingCategory = useMemo(
    () =>
      categories.find((category) => category.id === editingCategoryId) ?? null,
    [categories, editingCategoryId],
  );

  const topLevelCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories],
  );

  const childCategoriesByParentId = useMemo(() => {
    const childMap = new Map<string, Category[]>();

    categories.forEach((category) => {
      if (!category.parentId) {
        return;
      }

      const existingChildren = childMap.get(category.parentId) ?? [];
      childMap.set(category.parentId, [...existingChildren, category]);
    });

    return childMap;
  }, [categories]);

  const editingCategoryHasChildren = useMemo(
    () =>
      editingCategoryId
        ? categories.some((category) => category.parentId === editingCategoryId)
        : false,
    [categories, editingCategoryId],
  );

  const availableParentCategories = useMemo(
    () =>
      topLevelCategories.filter(
        (category) => category.id !== editingCategoryId,
      ),
    [editingCategoryId, topLevelCategories],
  );

  function updateFormValue<Key extends keyof CategoryFormValues>(
    key: Key,
    value: CategoryFormValues[Key],
  ) {
    setFormValues((currentValues) => ({ ...currentValues, [key]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
  }

  function resetForm() {
    setFormValues({
      ...emptyFormValues,
      sortOrder: getNextSortOrder(categories),
    });
    setErrors({});
    setEditingCategoryId(null);
  }

  function startEditing(category: Category) {
    setEditingCategoryId(category.id);
    setErrors({});
    setFormValues({
      name: category.name,
      parentId: category.parentId,
      budgetType: category.budgetType,
      icon: category.icon ?? '',
      sortOrder: String(category.sortOrder),
    });
  }

  async function handleSave() {
    const validation = validateCategoryForm(formValues, {
      categories: categoryOptions,
      editingCategoryId,
    });

    if (!validation.data) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSaving(true);

      if (editingCategoryId) {
        await updateCategory(editingCategoryId, validation.data);
      } else {
        await createCategory(validation.data);
      }

      resetForm();
    } catch (error) {
      console.warn('Failed to save category', error);
      setErrors({ form: 'Could not save category. Try again.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-24 pt-6"
      >
        <Text className="text-3xl font-semibold text-slate-950">
          Categories
        </Text>
        <Text className="mt-2 text-base text-slate-600">
          Manage budget categories and one-level parent groups.
        </Text>

        <View className="mt-6 gap-3">
          {categories.length === 0 ? (
            <Card>
              <Text className="text-base font-medium text-slate-950">
                No categories yet
              </Text>
              <Text className="mt-1 text-sm text-slate-600">
                Add a category to start organizing spending.
              </Text>
            </Card>
          ) : (
            topLevelCategories.map((category) => (
              <CategoryGroupCard
                category={category}
                childCategories={
                  childCategoriesByParentId.get(category.id) ?? []
                }
                key={category.id}
                onEdit={startEditing}
              />
            ))
          )}
        </View>

        <Card className="mb-24 mt-6">
          <Text className="text-xl font-semibold text-slate-950">
            {editingCategory ? 'Edit Category' : 'Add Category'}
          </Text>

          <View className="mt-4 gap-4">
            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Name
              </Text>
              <Input
                onChangeText={(value) => updateFormValue('name', value)}
                placeholder="Groceries"
                value={formValues.name}
              />
              {errors.name ? (
                <Text className="mt-1 text-sm text-red-700">{errors.name}</Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Parent
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <Pressable
                  className={`min-h-11 rounded-md border px-3 py-2 ${
                    formValues.parentId === null
                      ? 'border-emerald-700 bg-emerald-50'
                      : 'border-slate-300 bg-white'
                  }`}
                  onPress={() => updateFormValue('parentId', null)}
                >
                  <Text className="text-sm font-medium text-slate-950">
                    No parent
                  </Text>
                </Pressable>

                {availableParentCategories.map((category) => (
                  <Pressable
                    className={`min-h-11 rounded-md border px-3 py-2 ${
                      formValues.parentId === category.id
                        ? 'border-emerald-700 bg-emerald-50'
                        : 'border-slate-300 bg-white'
                    } ${editingCategoryHasChildren ? 'opacity-50' : ''}`}
                    disabled={editingCategoryHasChildren}
                    key={category.id}
                    onPress={() => updateFormValue('parentId', category.id)}
                  >
                    <Text className="text-sm font-medium text-slate-950">
                      {category.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {editingCategoryHasChildren ? (
                <Text className="mt-1 text-sm text-slate-600">
                  Categories with children stay top-level.
                </Text>
              ) : null}
              {errors.parentId ? (
                <Text className="mt-1 text-sm text-red-700">
                  {errors.parentId}
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Budget Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {BUDGET_TYPES.map((option) => (
                  <Pressable
                    className={`min-h-11 rounded-md border px-3 py-2 ${
                      formValues.budgetType === option.value
                        ? 'border-emerald-700 bg-emerald-50'
                        : 'border-slate-300 bg-white'
                    }`}
                    key={option.value}
                    onPress={() => updateFormValue('budgetType', option.value)}
                  >
                    <Text className="text-sm font-medium text-slate-950">
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.budgetType ? (
                <Text className="mt-1 text-sm text-red-700">
                  {errors.budgetType}
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Icon
              </Text>
              <Input
                onChangeText={(value) => updateFormValue('icon', value)}
                placeholder="cart"
                value={formValues.icon}
              />
              {errors.icon ? (
                <Text className="mt-1 text-sm text-red-700">{errors.icon}</Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Sort Order
              </Text>
              <Input
                keyboardType="number-pad"
                onChangeText={(value) => updateFormValue('sortOrder', value)}
                placeholder="0"
                value={formValues.sortOrder}
              />
              {errors.sortOrder ? (
                <Text className="mt-1 text-sm text-red-700">
                  {errors.sortOrder}
                </Text>
              ) : null}
            </View>

            {errors.form ? (
              <Text className="text-sm text-red-700">{errors.form}</Text>
            ) : null}

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button disabled={isSaving} onPress={handleSave}>
                  {isSaving ? 'Saving...' : editingCategory ? 'Save' : 'Add'}
                </Button>
              </View>

              {editingCategory ? (
                <View className="flex-1">
                  <Button
                    disabled={isSaving}
                    onPress={resetForm}
                    variant="ghost"
                  >
                    Cancel
                  </Button>
                </View>
              ) : null}
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
