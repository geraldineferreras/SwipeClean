export const theme = {
  colors: {
    background: '#F8F9FB',
    surface: '#FFFFFF',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    accent: '#2563EB',
    accentSoft: '#EFF6FF',
    border: '#E5E7EB',
    savings: '#0D9488',
    savingsSoft: '#F0FDFA',
    delete: '#EF4444',
    deleteSoft: '#FEF2F2',
    keep: '#10B981',
    keepSoft: '#ECFDF5',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    pill: 999,
  },
  typography: {
    hero: 40,
    title: 28,
    subtitle: 18,
    body: 16,
    caption: 13,
    label: 12,
  },
} as const;

export type Theme = typeof theme;
