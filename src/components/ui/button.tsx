import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text } from 'react-native';

type PressableProps = ComponentProps<typeof Pressable>;

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

const variantClassNames = {
  primary: 'bg-emerald-700 active:bg-emerald-800',
  secondary: 'bg-slate-200 active:bg-slate-300',
  ghost: 'bg-transparent active:bg-slate-100',
};

const textClassNames = {
  primary: 'text-white',
  secondary: 'text-slate-950',
  ghost: 'text-slate-950',
};

export function Button({ children, className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <Pressable
      className={`min-h-11 items-center justify-center rounded-md px-4
      ${variantClassNames[variant]} ${className ?? ''}`}
      {...props}
    >
      <Text className={`text-base font-semibold ${textClassNames[variant]}`}>{children}</Text>
    </Pressable>
  );
}
