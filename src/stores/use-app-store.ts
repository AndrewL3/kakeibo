import { create } from 'zustand';

import type { MonthString } from '@/lib';

function getCurrentMonth(): MonthString {
  return new Date().toISOString().slice(0, 7) as MonthString;
}

interface AppState {
  selectedMonth: MonthString;
  setSelectedMonth: (month: MonthString) => void;
  resetSelectedMonth: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedMonth: getCurrentMonth(),
  setSelectedMonth: (month) => {
    set({ selectedMonth: month });
  },
  resetSelectedMonth: () => {
    set({ selectedMonth: getCurrentMonth() });
  },
}));
