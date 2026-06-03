import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmountDisplay, Button, Card, Input } from '@/components/ui';
import type { Account } from '@/db/models';
import {
  createAccount,
  formatMoneyInput,
  observeActiveAccounts,
  updateAccount,
  validateAccountForm,
} from '@/features/accounts';
import type { AccountFormErrors, AccountFormValues } from '@/features/accounts';
import { ACCOUNT_TYPES, DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from '@/lib';

const emptyFormValues: AccountFormValues = {
  name: '',
  type: 'chequing',
  currency: DEFAULT_CURRENCY,
  balance: '0',
};

function getAccountTypeLabel(type: Account['type']): string {
  return ACCOUNT_TYPES.find((option) => option.value === type)?.label ?? type;
}

export default function AccountsScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formValues, setFormValues] =
    useState<AccountFormValues>(emptyFormValues);
  const [errors, setErrors] = useState<AccountFormErrors>({});
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const subscription = observeActiveAccounts().subscribe(setAccounts);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const editingAccount = useMemo(
    () => accounts.find((account) => account.id === editingAccountId) ?? null,
    [accounts, editingAccountId],
  );

  function updateFormValue<Key extends keyof AccountFormValues>(
    key: Key,
    value: AccountFormValues[Key],
  ) {
    setFormValues((currentValues) => ({ ...currentValues, [key]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [key]: undefined }));
  }

  function resetForm() {
    setFormValues(emptyFormValues);
    setErrors({});
    setEditingAccountId(null);
  }

  function startEditing(account: Account) {
    setEditingAccountId(account.id);
    setErrors({});
    setFormValues({
      name: account.name,
      type: account.type,
      currency: account.currency,
      balance: formatMoneyInput(account.balance, account.currency),
    });
  }

  async function handleSave() {
    const validation = validateAccountForm(formValues);

    if (!validation.data) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSaving(true);

      if (editingAccountId) {
        await updateAccount(editingAccountId, validation.data);
      } else {
        await createAccount(validation.data);
      }

      resetForm();
    } catch (error) {
      console.warn('Failed to save account', error);
      setErrors({ form: 'Could not save account. Try again.' });
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
        <Text className="text-3xl font-semibold text-slate-950">Accounts</Text>
        <Text className="mt-2 text-base text-slate-600">
          Manage the accounts used for transactions and budgets.
        </Text>

        <View className="mt-6 gap-3">
          {accounts.length === 0 ? (
            <Card>
              <Text className="text-base font-medium text-slate-950">
                No accounts yet
              </Text>
              <Text className="mt-1 text-sm text-slate-600">
                Add your first account to start tracking balances.
              </Text>
            </Card>
          ) : (
            accounts.map((account) => (
              <Card key={account.id}>
                <View className="gap-3">
                  <View className="min-w-0">
                    <Text className="text-lg font-semibold text-slate-950">
                      {account.name}
                    </Text>
                    <Text className="mt-1 text-sm text-slate-600">
                      {getAccountTypeLabel(account.type)} · {account.currency}
                    </Text>
                    <AmountDisplay
                      amount={account.balance}
                      className="mt-3 text-xl text-slate-950"
                      currency={account.currency}
                    />
                  </View>

                  <View className="items-start">
                    <Button
                      accessibilityLabel={`Edit ${account.name}`}
                      onPress={() => startEditing(account)}
                      variant="secondary"
                    >
                      Edit
                    </Button>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        <Card className="mb-24 mt-6">
          <Text className="text-xl font-semibold text-slate-950">
            {editingAccount ? 'Edit Account' : 'Add Account'}
          </Text>

          <View className="mt-4 gap-4">
            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Name
              </Text>
              <Input
                onChangeText={(value) => updateFormValue('name', value)}
                placeholder="Main chequing"
                value={formValues.name}
              />
              {errors.name ? (
                <Text className="mt-1 text-sm text-red-700">{errors.name}</Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Type
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ACCOUNT_TYPES.map((option) => (
                  <Pressable
                    className={`min-h-11 rounded-md border px-3 py-2 ${
                      formValues.type === option.value
                        ? 'border-emerald-700 bg-emerald-50'
                        : 'border-slate-300 bg-white'
                    }`}
                    key={option.value}
                    onPress={() => updateFormValue('type', option.value)}
                  >
                    <Text className="text-sm font-medium text-slate-950">
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.type ? (
                <Text className="mt-1 text-sm text-red-700">{errors.type}</Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Currency
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SUPPORTED_CURRENCIES.map((option) => (
                  <Pressable
                    className={`min-h-11 rounded-md border px-3 py-2 ${
                      formValues.currency === option.value
                        ? 'border-emerald-700 bg-emerald-50'
                        : 'border-slate-300 bg-white'
                    }`}
                    key={option.value}
                    onPress={() => updateFormValue('currency', option.value)}
                  >
                    <Text className="text-sm font-medium text-slate-950">
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.currency ? (
                <Text className="mt-1 text-sm text-red-700">
                  {errors.currency}
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-700">
                Balance
              </Text>
              <Input
                keyboardType="decimal-pad"
                onChangeText={(value) => updateFormValue('balance', value)}
                placeholder={formValues.currency === 'TWD' ? '1000' : '1000.00'}
                value={formValues.balance}
              />
              {errors.balance ? (
                <Text className="mt-1 text-sm text-red-700">
                  {errors.balance}
                </Text>
              ) : null}
            </View>

            {errors.form ? (
              <Text className="text-sm text-red-700">{errors.form}</Text>
            ) : null}

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Button disabled={isSaving} onPress={handleSave}>
                  {isSaving ? 'Saving...' : editingAccount ? 'Save' : 'Add'}
                </Button>
              </View>

              {editingAccount ? (
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
