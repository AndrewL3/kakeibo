import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'accounts',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'balance', type: 'number' },
        { name: 'currency', type: 'string' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'parent_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'budget_type', type: 'string' },
        { name: 'icon', type: 'string', isOptional: true },
        { name: 'sort_order', type: 'number' },
        { name: 'is_active', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'category_budgets',
      columns: [
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'month', type: 'string', isIndexed: true },
        { name: 'allocated_amount', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'account_id', type: 'string', isIndexed: true },
        { name: 'date', type: 'number', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'payee', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'cleared', type: 'boolean' },
        { name: 'is_transfer', type: 'boolean' },
        { name: 'transfer_account_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'transaction_splits',
      columns: [
        { name: 'transaction_id', type: 'string', isIndexed: true },
        { name: 'category_id', type: 'string', isIndexed: true },
        { name: 'amount', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'recurring_templates',
      columns: [
        { name: 'account_id', type: 'string', isIndexed: true },
        { name: 'category_id', type: 'string', isOptional: true, isIndexed: true },
        { name: 'payee', type: 'string' },
        { name: 'amount', type: 'number' },
        { name: 'rrule', type: 'string' },
        { name: 'next_due_date', type: 'number', isIndexed: true },
        { name: 'is_active', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'sync_log',
      columns: [
        { name: 'table_name', type: 'string', isIndexed: true },
        { name: 'last_pulled_at', type: 'number' },
        { name: 'last_pushed_at', type: 'number' },
      ],
    }),
  ],
});
