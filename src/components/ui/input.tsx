import type { ComponentProps } from 'react';
import { TextInput } from 'react-native';

type TextInputProps = ComponentProps<typeof TextInput>;

export function Input({ className, placeholderTextColor = '#94a3b8', ...props }: TextInputProps) {
  return (
    <TextInput
      className={`min-h-11 rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950
      ${className ?? ''}`}
      placeholderTextColor={placeholderTextColor}
      {...props}
    />
  );
}
