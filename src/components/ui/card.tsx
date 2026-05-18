import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

type ViewProps = ComponentProps<typeof View>;

interface CardProps extends ViewProps {
  children: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View className={`rounded-lg border border-slate-200 bg-white p-4 ${className ?? ''}`}
      {...props}>
      {children}
    </View>
  );
}
