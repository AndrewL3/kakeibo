import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import type { MonthString } from '@/lib';

interface MonthPickerProps {
  month: MonthString;
  onMonthChange: (month: MonthString) => void;
}

function shiftMonth(month: MonthString, offset: number): MonthString {
  const [year, monthIndex] = month.split('-').map(Number);
  const date = new Date(year, monthIndex - 1 + offset, 1);

  return date.toISOString().slice(0, 7) as MonthString;
}

export function MonthPicker({ month, onMonthChange }: MonthPickerProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        accessibilityLabel="Previous month"
        className="h-11 w-11 items-center justify-center rounded-full active:bg-slate-100"
        onPress={() => onMonthChange(shiftMonth(month, -1))}
      >
        <ChevronLeft color="#0f172a" size={22} />
      </Pressable>

      <Text className="text-lg font-semibold text-slate-950">{month}</Text>

      <Pressable
        accessibilityLabel="Next month"
        className="h-11 w-11 items-center justify-center rounded-full active:bg-slate-100"
        onPress={() => onMonthChange(shiftMonth(month, 1))}
      >
        <ChevronRight color="#0f172a" size={22} />
      </Pressable>
    </View>
  );
}
