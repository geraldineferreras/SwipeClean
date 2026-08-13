import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  AppModal,
  type AppModalButton,
  type AppModalOption,
} from '@/components/shared/AppModal';

interface ShowModalOptions {
  buttons: AppModalButton[];
  message?: string;
  options?: AppModalOption[];
  title: string;
}

interface ConfirmModalOptions {
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
  message?: string;
  onConfirm?: () => void;
  title: string;
}

interface AlertModalOptions {
  buttonText?: string;
  message?: string;
  onPress?: () => void;
  title: string;
}

interface OptionsModalOptions {
  cancelText?: string;
  message?: string;
  onSelect: (index: number) => void;
  options: string[];
  title: string;
}

interface AppModalContextValue {
  showAlert: (options: AlertModalOptions) => void;
  showConfirm: (options: ConfirmModalOptions) => void;
  showModal: (options: ShowModalOptions) => void;
  showOptions: (options: OptionsModalOptions) => void;
}

const AppModalContext = createContext<AppModalContextValue | null>(null);

export function AppModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ShowModalOptions | null>(null);

  const hideModal = useCallback(() => {
    setModalState(null);
  }, []);

  const showModal = useCallback((options: ShowModalOptions) => {
    setModalState(options);
  }, []);

  const showConfirm = useCallback(
    ({
      title,
      message,
      confirmText = 'Remove',
      cancelText = 'Cancel',
      destructive = true,
      onConfirm,
    }: ConfirmModalOptions) => {
      showModal({
        title,
        message,
        buttons: [
          { text: cancelText, style: 'cancel', onPress: hideModal },
          {
            text: confirmText,
            style: destructive ? 'destructive' : 'default',
            onPress: () => {
              hideModal();
              onConfirm?.();
            },
          },
        ],
      });
    },
    [hideModal, showModal],
  );

  const showAlert = useCallback(
    ({ title, message, buttonText = 'OK', onPress }: AlertModalOptions) => {
      showModal({
        title,
        message,
        buttons: [
          {
            text: buttonText,
            style: 'default',
            onPress: () => {
              hideModal();
              onPress?.();
            },
          },
        ],
      });
    },
    [hideModal, showModal],
  );

  const showOptions = useCallback(
    ({
      title,
      message,
      options,
      onSelect,
      cancelText = 'Cancel',
    }: OptionsModalOptions) => {
      showModal({
        title,
        message,
        options: options.map((label, index) => ({
          label,
          onPress: () => {
            hideModal();
            onSelect(index);
          },
        })),
        buttons: [{ text: cancelText, style: 'cancel', onPress: hideModal }],
      });
    },
    [hideModal, showModal],
  );

  const value = useMemo(
    () => ({
      showAlert,
      showConfirm,
      showModal,
      showOptions,
    }),
    [showAlert, showConfirm, showModal, showOptions],
  );

  return (
    <AppModalContext.Provider value={value}>
      {children}
      <AppModal
        buttons={modalState?.buttons ?? []}
        message={modalState?.message}
        onDismiss={hideModal}
        options={modalState?.options}
        title={modalState?.title ?? ''}
        visible={modalState !== null}
      />
    </AppModalContext.Provider>
  );
}

export function useAppModal() {
  const context = useContext(AppModalContext);

  if (!context) {
    throw new Error('useAppModal must be used within AppModalProvider');
  }

  return context;
}
