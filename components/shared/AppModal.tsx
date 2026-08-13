import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

export type AppModalButtonStyle = 'cancel' | 'default' | 'destructive';

export interface AppModalButton {
  onPress?: () => void;
  style?: AppModalButtonStyle;
  text: string;
}

export interface AppModalOption {
  label: string;
  onPress?: () => void;
}

interface AppModalProps {
  buttons: AppModalButton[];
  message?: string;
  onDismiss: () => void;
  options?: AppModalOption[];
  title: string;
  visible: boolean;
}

export function AppModal({ visible, title, message, options, buttons, onDismiss }: AppModalProps) {
  const handlePress = (button: AppModalButton) => {
    button.onPress?.();
  };

  const handleOptionPress = (option: AppModalOption) => {
    option.onPress?.();
  };

  return (
    <Modal animationType="fade" onRequestClose={onDismiss} transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {options && options.length > 0 ? (
            <View style={styles.options}>
              {options.map((option) => (
                <Pressable
                  key={option.label}
                  onPress={() => handleOptionPress(option)}
                  style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
                >
                  <Text style={styles.optionLabel}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View
            style={[
              styles.buttons,
              buttons.length === 1 ? styles.buttonsSingle : null,
            ]}
          >
            {buttons.map((button) => {
              const isCancel = button.style === 'cancel';
              const isDestructive = button.style === 'destructive';
              const isSingle = buttons.length === 1;

              return (
                <Pressable
                  key={button.text}
                  onPress={() => handlePress(button)}
                  style={({ pressed }) => [
                    styles.button,
                    isSingle && styles.buttonSingle,
                    isCancel && styles.cancelButton,
                    isDestructive && styles.destructiveButton,
                    !isCancel && !isDestructive && styles.primaryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonLabel,
                      isCancel && styles.cancelLabel,
                      isDestructive && styles.destructiveLabel,
                      !isCancel && !isDestructive && styles.primaryLabel,
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
  },
  buttonSingle: {
    alignSelf: 'stretch',
    flex: 0,
    flexGrow: 0,
    width: '100%',
  },
  buttonLabel: {
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  buttons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  buttonsSingle: {
    flexDirection: 'column',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  cancelLabel: {
    color: theme.colors.textPrimary,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    maxWidth: 360,
    overflow: 'visible',
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    width: '100%',
  },
  destructiveButton: {
    backgroundColor: theme.colors.delete,
  },
  destructiveLabel: {
    color: '#FFFFFF',
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.body,
    lineHeight: 22,
    marginTop: theme.spacing.sm,
  },
  optionLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  optionRow: {
    borderColor: theme.colors.border,
    borderTopWidth: 1,
    paddingVertical: theme.spacing.md,
  },
  options: {
    marginTop: theme.spacing.sm,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  pressed: {
    opacity: 0.88,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '800',
  },
});
