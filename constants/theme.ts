import { Platform } from 'react-native';

// ─── Paleta principal do InfasCare ───────────────────────────────────────────
export const Brand = {
  purple: '#6A5AE0',
  lilac:  '#A78BFA',
  blue:   '#4A90E2',
  error:  '#D94040',
};

// ─── Cores por tema ──────────────────────────────────────────────────────────
export const Colors = {
  light: {
    // Fundos
    background:      '#FFFFFF',
    backgroundSoft:  '#F7F6FB',
    backgroundCard:  '#FFFFFF',
    // Textos
    text:            '#1a1a2e',
    textSecondary:   '#8E8EA0',
    textMuted:       '#9090A8',
    // Bordas / separadores
    border:          '#E8E6F0',
    borderInput:     '#E8E6F0',
    // Inputs
    inputBg:         '#FAFAFE',
    // Tab bar
    tabBar:          '#FFFFFF',
    tabBarBorder:    '#E8E6F0',
    // Ícones
    icon:            '#687076',
    tabIconDefault:  '#8e8e93',
    tabIconSelected: Brand.purple,
    // Acento decorativo
    accentSoft:      '#EBE9FF',
    accentWave:      '#EBE9FF',
    gradientBottom:  '#C4B5FD',
    // Tint (legado)
    tint:            Brand.purple,
  },
  dark: {
    background:      '#0D0B1E',
    backgroundSoft:  '#13112A',
    backgroundCard:  '#1C1835',
    text:            '#F0EEFF',
    textSecondary:   '#A09BBF',
    textMuted:       '#7A7595',
    border:          '#2D2850',
    borderInput:     '#2D2850',
    inputBg:         '#1C1835',
    tabBar:          '#100E22',
    tabBarBorder:    '#2D2850',
    icon:            '#9BA1A6',
    tabIconDefault:  '#7A7595',
    tabIconSelected: Brand.lilac,
    accentSoft:      'rgba(106,90,224,0.15)',
    accentWave:      'rgba(106,90,224,0.2)',
    gradientBottom:  '#2D1F6E',
    tint:            Brand.lilac,
  },
};

// ─── Definição de Fontes (Poppins como principal) ───────────────────────────
// Certifique-se de que o nome da fonte aqui é o mesmo usado no useFonts
export const Fonts = {
  regular: 'Poppins-Regular',
  medium:  'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold:    'Poppins-Bold',
  
  // Mapeamento para componentes que esperam um nome de fonte padrão
  family: Platform.select({
    ios: 'Poppins',
    android: 'Poppins',
    default: 'Poppins',
  }),
  web: {
    sans:    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:   "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono:    "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
};