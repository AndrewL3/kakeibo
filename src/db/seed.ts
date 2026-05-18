import type { AccountType, BudgetType } from '@/lib';

interface SeedCategory {
  name: string;
  budgetType: BudgetType;
  icon: string;
  sortOrder: number;
}

interface SeedAccount {
  name: string;
  type: AccountType;
}

export const seedAccounts: ReadonlyArray<SeedAccount> = [
  { name: 'Cash', type: 'cash' },
  { name: 'Main Chequing', type: 'chequing' },
];

export const seedCategories: ReadonlyArray<SeedCategory> = [
  { name: 'Rent', budgetType: 'need', icon: 'home', sortOrder: 10 },
  { name: 'Groceries', budgetType: 'need', icon: 'shopping-basket', sortOrder: 20 },
  { name: 'Transit', budgetType: 'need', icon: 'train', sortOrder: 30 },
  { name: 'Restaurants', budgetType: 'want', icon: 'utensils', sortOrder: 40 },
  { name: 'Entertainment', budgetType: 'want', icon: 'ticket', sortOrder: 50 },
  { name: 'Emergency Fund', budgetType: 'savings', icon: 'shield', sortOrder: 60 },
  { name: 'Investments', budgetType: 'savings', icon: 'trending-up', sortOrder: 70 },
];
