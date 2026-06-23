import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/theme';

export type ThemeColors = typeof Colors.light;

/** Retorna o objeto completo de cores do tema atual */
export function useTheme(): ThemeColors {
  const scheme = useColorScheme() ?? 'light';
  return Colors[scheme];
}

/** Retorna uma cor específica do tema atual */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors,
): string {
  const scheme = useColorScheme() ?? 'light';
  return props[scheme] ?? Colors[scheme][colorName];
}