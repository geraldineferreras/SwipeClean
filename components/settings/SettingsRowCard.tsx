import type { ComponentProps, ReactNode } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface SettingsRowCardProps {
  icon: IoniconName;
  onPress?: () => void;
  subtitle: string;
  title: string;
  trailing?: ReactNode;
}

export function SettingsRowCard({
  icon,
  onPress,
  subtitle,
  title,
  trailing,
}: SettingsRowCardProps) {
  const content = (
    <>
      <View style={styles.iconWrap}>
        <Ionicons color={theme.colors.textSecondary} name={icon} size={22} />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

interface SettingsLinkRowProps {
  icon: IoniconName;
  isLast?: boolean;
  label: string;
  onPress?: () => void;
  trailingText?: string;
}

export function SettingsLinkRow({
  icon,
  isLast,
  label,
  onPress,
  trailingText,
}: SettingsLinkRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        !isLast && styles.linkRowBorder,
        pressed && styles.linkRowPressed,
      ]}
    >
      <Ionicons color={theme.colors.textSecondary} name={icon} size={20} />
      <Text style={styles.linkLabel}>{label}</Text>
      {trailingText ? <Text style={styles.linkTrailing}>{trailingText}</Text> : null}
      {!trailingText ? (
        <Ionicons color={theme.colors.textMuted} name="chevron-forward" size={18} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  cardPressed: {
    opacity: 0.92,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  linkLabel: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontSize: theme.typography.body,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  linkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  linkRowBorder: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  linkRowPressed: {
    backgroundColor: theme.colors.background,
  },
  linkTrailing: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    fontWeight: '600',
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.caption,
    lineHeight: 18,
    marginTop: 2,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: 2,
  },
});
