import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button, Input } from '@/components/ui';
import type { Account, Category } from '@/db/models';

import { getCategoryFilterLabel } from './transaction-list';
import type {
  TransactionFormErrors,
  TransactionFormValues,
  TransactionInput,
  TransactionSplitFormValues,
} from './types';
import { validateTransactionForm } from './validation';

interface OptionPillProps {
  isSelected: boolean;
  label: string;
  onPress: () => void;
}

function OptionPill({ isSelected, label, onPress }: OptionPillProps) {
  return (
    <Pressable
      className={`min-h-11 rounded-md border px-3 py-2 ${
        isSelected
          ? 'border-emerald-700 bg-emerald-50'
          : 'border-slate-300 bg-white'
      }`}
      onPress={onPress}
    >
      <Text className="text-sm font-medium text-slate-950">{label}</Text>
    </Pressable>
  );
}

function createEmptySplit(
  categoryId: string | null,
  amount = '',
): TransactionSplitFormValues {
  return {
    amount,
    categoryId,
    id: null,
    notes: '',
  };
}

function getDefaultTransferAccountId(
  accounts: ReadonlyArray<Account>,
  sourceAccountId: string | null,
): string | null {
  return accounts.find((account) => account.id !== sourceAccountId)?.id ?? null;
}

interface TransactionFormProps {
  accounts: ReadonlyArray<Account>;
  categories: ReadonlyArray<Category>;
  initialValues: TransactionFormValues;
  onCancel?: () => void;
  onSubmit: (input: TransactionInput) => Promise<void>;
  submitLabel: string;
  variant?: 'standard' | 'quick-add';
}

export function TransactionForm({
  accounts,
  categories,
  initialValues,
  onCancel,
  onSubmit,
  submitLabel,
  variant = 'standard',
}: TransactionFormProps) {
  const isQuickAdd = variant === 'quick-add';
  const [formValues, setFormValues] =
    useState<TransactionFormValues>(initialValues);
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSplitEditorExpanded, setIsSplitEditorExpanded] = useState(
    !isQuickAdd || initialValues.splits.length > 1,
  );

  useEffect(() => {
    setFormValues(initialValues);
    setErrors({});
    setIsSplitEditorExpanded(!isQuickAdd || initialValues.splits.length > 1);
  }, [initialValues, isQuickAdd]);

  const selectedAccount = useMemo(
    () =>
      formValues.accountId
        ? (accounts.find((account) => account.id === formValues.accountId) ??
          null)
        : null,
    [accounts, formValues.accountId],
  );

  const categoriesById = useMemo(
    () =>
      new Map(categories.map((category) => [category.id, category] as const)),
    [categories],
  );

  function updateFormValue<Key extends keyof TransactionFormValues>(
    key: Key,
    value: TransactionFormValues[Key],
  ) {
    setFormValues((currentValues) => {
      if (key === 'amount') {
        const nextAmount = String(value);
        const shouldSyncOnlySplit =
          !currentValues.isTransfer &&
          currentValues.splits.length === 1 &&
          (currentValues.splits[0].amount.length === 0 ||
            currentValues.splits[0].amount === currentValues.amount);

        return {
          ...currentValues,
          amount: nextAmount,
          splits: shouldSyncOnlySplit
            ? [{ ...currentValues.splits[0], amount: nextAmount }]
            : currentValues.splits,
        };
      }

      return { ...currentValues, [key]: value };
    });
    setErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
  }

  function selectTransactionMode(isTransfer: boolean) {
    setFormValues((currentValues) => ({
      ...currentValues,
      isTransfer,
      transferAccountId: isTransfer
        ? currentValues.transferAccountId &&
          currentValues.transferAccountId !== currentValues.accountId
          ? currentValues.transferAccountId
          : getDefaultTransferAccountId(accounts, currentValues.accountId)
        : null,
    }));
    setIsSplitEditorExpanded((currentValue) =>
      isTransfer ? false : !isQuickAdd || currentValue,
    );
    setErrors({});
  }

  function selectAccount(accountId: string) {
    setFormValues((currentValues) => {
      const shouldReplaceTransferAccount =
        currentValues.isTransfer &&
        (!currentValues.transferAccountId ||
          currentValues.transferAccountId === accountId);

      return {
        ...currentValues,
        accountId,
        transferAccountId: shouldReplaceTransferAccount
          ? getDefaultTransferAccountId(accounts, accountId)
          : currentValues.transferAccountId,
      };
    });
    setErrors((currentErrors) => ({
      ...currentErrors,
      accountId: undefined,
      transferAccountId: undefined,
    }));
  }

  function updateSplitValue<Key extends keyof TransactionSplitFormValues>(
    index: number,
    key: Key,
    value: TransactionSplitFormValues[Key],
  ) {
    setFormValues((currentValues) => ({
      ...currentValues,
      splits: currentValues.splits.map((split, splitIndex) =>
        splitIndex === index ? { ...split, [key]: value } : split,
      ),
    }));
    setErrors({});
  }

  function addSplit() {
    setFormValues((currentValues) => ({
      ...currentValues,
      splits: [
        ...currentValues.splits,
        createEmptySplit(categories[0]?.id ?? null),
      ],
    }));
    setIsSplitEditorExpanded(true);
    setErrors({});
  }

  function removeSplit(index: number) {
    setFormValues((currentValues) => ({
      ...currentValues,
      splits: currentValues.splits.filter(
        (_, splitIndex) => splitIndex !== index,
      ),
    }));
    setErrors({});
  }

  async function handleSubmit() {
    const validation = validateTransactionForm(formValues, {
      accounts,
      categories,
    });

    if (!validation.data) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSaving(true);
      await onSubmit(validation.data);
    } catch (error) {
      console.warn('Failed to save transaction', error);
      setErrors({ form: 'Could not save transaction. Try again.' });
    } finally {
      setIsSaving(false);
    }
  }

  const showCompactCategoryPicker =
    isQuickAdd &&
    !formValues.isTransfer &&
    !isSplitEditorExpanded &&
    formValues.splits.length === 1;
  const primarySplit = showCompactCategoryPicker ? formValues.splits[0] : null;
  const primarySplitErrors = errors.splitRows?.[0] ?? {};

  return (
    <View className={isQuickAdd ? 'gap-3' : 'gap-4'}>
      <View>
        <Text className="mb-2 text-sm font-medium text-slate-700">
          {selectedAccount ? `Amount · ${selectedAccount.currency}` : 'Amount'}
        </Text>
        <Input
          className={isQuickAdd ? 'min-h-16 text-3xl font-semibold' : undefined}
          keyboardType="numbers-and-punctuation"
          onChangeText={(value) => updateFormValue('amount', value)}
          placeholder={selectedAccount?.currency === 'CAD' ? '-12.34' : '-100'}
          value={formValues.amount}
        />
        {errors.amount ? (
          <Text className="mt-1 text-sm text-red-700">{errors.amount}</Text>
        ) : null}
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-slate-700">Date</Text>
        <Input
          onChangeText={(value) => updateFormValue('date', value)}
          placeholder="2026-06-13"
          value={formValues.date}
        />
        {errors.date ? (
          <Text className="mt-1 text-sm text-red-700">{errors.date}</Text>
        ) : null}
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-slate-700">Type</Text>
        <View className="flex-row flex-wrap gap-2">
          <OptionPill
            isSelected={!formValues.isTransfer}
            label="Category"
            onPress={() => selectTransactionMode(false)}
          />
          <OptionPill
            isSelected={formValues.isTransfer}
            label="Transfer"
            onPress={() => selectTransactionMode(true)}
          />
        </View>
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-slate-700">Payee</Text>
        <Input
          onChangeText={(value) => updateFormValue('payee', value)}
          placeholder={
            formValues.isTransfer ? 'Transfer between accounts' : 'Coffee shop'
          }
          value={formValues.payee}
        />
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-slate-700">
          {formValues.isTransfer ? 'From Account' : 'Account'}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {accounts.map((account) => (
            <OptionPill
              isSelected={formValues.accountId === account.id}
              key={account.id}
              label={`${account.name} · ${account.currency}`}
              onPress={() => selectAccount(account.id)}
            />
          ))}
        </View>
        {errors.accountId ? (
          <Text className="mt-1 text-sm text-red-700">{errors.accountId}</Text>
        ) : null}
      </View>

      {formValues.isTransfer ? (
        <View>
          <Text className="mb-2 text-sm font-medium text-slate-700">
            To Account
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {accounts
              .filter((account) => account.id !== formValues.accountId)
              .map((account) => (
                <OptionPill
                  isSelected={formValues.transferAccountId === account.id}
                  key={account.id}
                  label={`${account.name} · ${account.currency}`}
                  onPress={() =>
                    updateFormValue('transferAccountId', account.id)
                  }
                />
              ))}
          </View>
          {accounts.length < 2 ? (
            <Text className="mt-1 text-sm text-slate-600">
              Add another account to record a transfer.
            </Text>
          ) : null}
          {errors.transferAccountId ? (
            <Text className="mt-1 text-sm text-red-700">
              {errors.transferAccountId}
            </Text>
          ) : null}
        </View>
      ) : showCompactCategoryPicker && primarySplit ? (
        <View>
          <View className="mb-2 flex-row items-center justify-between gap-3">
            <Text className="text-sm font-medium text-slate-700">Category</Text>
            <Pressable
              className="min-h-11 rounded-md bg-slate-200 px-3 py-2 active:bg-slate-300"
              onPress={() => setIsSplitEditorExpanded(true)}
            >
              <Text className="text-sm font-semibold text-slate-950">
                Split
              </Text>
            </Pressable>
          </View>

          {categories.length === 0 ? (
            <Text className="mb-3 text-sm text-slate-600">
              Add a category before recording category transactions.
            </Text>
          ) : null}

          <View className="flex-row flex-wrap gap-2">
            {categories.map((category) => (
              <OptionPill
                isSelected={primarySplit.categoryId === category.id}
                key={category.id}
                label={getCategoryFilterLabel(category, categoriesById)}
                onPress={() => updateSplitValue(0, 'categoryId', category.id)}
              />
            ))}
          </View>

          {primarySplitErrors.categoryId ? (
            <Text className="mt-1 text-sm text-red-700">
              {primarySplitErrors.categoryId}
            </Text>
          ) : null}

          {primarySplitErrors.amount ? (
            <Text className="mt-1 text-sm text-red-700">
              {primarySplitErrors.amount}
            </Text>
          ) : null}

          {errors.splits ? (
            <Text className="mt-1 text-sm text-red-700">{errors.splits}</Text>
          ) : null}
        </View>
      ) : (
        <View>
          <View className="mb-2 flex-row items-center justify-between gap-3">
            <Text className="text-sm font-medium text-slate-700">Splits</Text>
            <Pressable
              className="min-h-11 rounded-md bg-slate-200 px-3 py-2 active:bg-slate-300"
              onPress={addSplit}
            >
              <Text className="text-sm font-semibold text-slate-950">
                Add Split
              </Text>
            </Pressable>
          </View>

          {categories.length === 0 ? (
            <Text className="mb-3 text-sm text-slate-600">
              Add a category before recording category transactions.
            </Text>
          ) : null}

          <View className="gap-3">
            {formValues.splits.map((split, index) => {
              const splitErrors = errors.splitRows?.[index] ?? {};

              return (
                <View
                  className="gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"
                  key={split.id ?? `new-${index}`}
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="text-sm font-semibold text-slate-950">
                      Split {index + 1}
                    </Text>
                    {formValues.splits.length > 1 ? (
                      <Pressable
                        className="min-h-11 justify-center rounded-md px-2 active:bg-slate-100"
                        onPress={() => removeSplit(index)}
                      >
                        <Text className="text-sm font-semibold text-red-700">
                          Remove
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>

                  <View>
                    <Text className="mb-2 text-sm font-medium text-slate-700">
                      Category
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {categories.map((category) => (
                        <OptionPill
                          isSelected={split.categoryId === category.id}
                          key={category.id}
                          label={getCategoryFilterLabel(
                            category,
                            categoriesById,
                          )}
                          onPress={() =>
                            updateSplitValue(index, 'categoryId', category.id)
                          }
                        />
                      ))}
                    </View>
                    {splitErrors.categoryId ? (
                      <Text className="mt-1 text-sm text-red-700">
                        {splitErrors.categoryId}
                      </Text>
                    ) : null}
                  </View>

                  <View>
                    <Text className="mb-2 text-sm font-medium text-slate-700">
                      Split Amount
                    </Text>
                    <Input
                      keyboardType="numbers-and-punctuation"
                      onChangeText={(value) =>
                        updateSplitValue(index, 'amount', value)
                      }
                      placeholder={
                        selectedAccount?.currency === 'CAD' ? '-12.34' : '-100'
                      }
                      value={split.amount}
                    />
                    {splitErrors.amount ? (
                      <Text className="mt-1 text-sm text-red-700">
                        {splitErrors.amount}
                      </Text>
                    ) : null}
                  </View>

                  <View>
                    <Text className="mb-2 text-sm font-medium text-slate-700">
                      Split Notes
                    </Text>
                    <Input
                      onChangeText={(value) =>
                        updateSplitValue(index, 'notes', value)
                      }
                      placeholder="Optional"
                      value={split.notes}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          {errors.splits ? (
            <Text className="mt-1 text-sm text-red-700">{errors.splits}</Text>
          ) : null}
        </View>
      )}

      <View>
        <Text className="mb-2 text-sm font-medium text-slate-700">Status</Text>
        <View className="flex-row flex-wrap gap-2">
          <OptionPill
            isSelected={formValues.cleared}
            label="Cleared"
            onPress={() => updateFormValue('cleared', true)}
          />
          <OptionPill
            isSelected={!formValues.cleared}
            label="Uncleared"
            onPress={() => updateFormValue('cleared', false)}
          />
        </View>
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-slate-700">Notes</Text>
        <Input
          multiline
          onChangeText={(value) => updateFormValue('notes', value)}
          placeholder="Optional"
          textAlignVertical="top"
          value={formValues.notes}
        />
      </View>

      {errors.form ? (
        <Text className="text-sm text-red-700">{errors.form}</Text>
      ) : null}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button disabled={isSaving} onPress={handleSubmit}>
            {isSaving ? 'Saving...' : submitLabel}
          </Button>
        </View>

        {onCancel ? (
          <View className="flex-1">
            <Button disabled={isSaving} onPress={onCancel} variant="ghost">
              Cancel
            </Button>
          </View>
        ) : null}
      </View>
    </View>
  );
}
