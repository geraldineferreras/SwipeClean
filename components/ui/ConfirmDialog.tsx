import { AppModal } from '@/components/shared/AppModal';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const showCancel = onCancel !== undefined;

  return (
    <AppModal
      buttons={[
        ...(showCancel
          ? [{ text: cancelLabel, style: 'cancel' as const, onPress: onCancel }]
          : []),
        {
          text: confirmLabel,
          style: destructive ? ('destructive' as const) : ('default' as const),
          onPress: onConfirm,
        },
      ]}
      message={message}
      onDismiss={onCancel ?? onConfirm}
      title={title}
      visible={visible}
    />
  );
}
