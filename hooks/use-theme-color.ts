import { useSettings } from '@/contexts/SettingsContext';

const lightTheme = {
  mode: 'light' as const,
  background: '#FFFFFF',
  backgroundSoft: '#F8F7FC',
  backgroundCard: '#FFFFFF',
  accent: '#7B4DFF',
  accentSoft: '#F3EDFF',
  text: '#21164D',
  textSecondary: '#6D6A80',
  textMuted: '#A9A5B8',
  border: '#DCD7EA',
  borderInput: '#ECE8F6',
  danger: '#FF4D4D',
  success: '#2ECC71',
};

const darkTheme = {
  mode: 'dark' as const,
  background: '#131020',
  backgroundSoft: '#171426',
  backgroundCard: '#211D32',
  accent: '#9A78FF',
  accentSoft: '#30264A',
  text: '#F8F6FF',
  textSecondary: '#C2BCD2',
  textMuted: '#8E879F',
  border: '#4A435B',
  borderInput: '#393247',
  danger: '#FF7379',
  success: '#55D98A',
};

export function useTheme() {
  const { resolvedColorScheme } = useSettings();

  return resolvedColorScheme === 'dark' ? darkTheme : lightTheme;
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof lightTheme,
) {
  const theme = useTheme();
  return props[theme.mode] ?? theme[colorName];
}
