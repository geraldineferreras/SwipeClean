import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export const APP_VERSION = '1.0.0';

export const RECOVERY_RETENTION_OPTIONS = [7, 14, 30] as const;
export type RecoveryRetentionDays = (typeof RECOVERY_RETENTION_OPTIONS)[number];

export interface AboutLinkItem {
  id: string;
  label: string;
  icon: IoniconName;
  url?: string;
}

export interface AboutContentItem {
  title: string;
  message: string;
}

export const ABOUT_CONTENT: Record<string, AboutContentItem> = {
  'how-it-works': {
    title: 'How It Works',
    message:
      'SwipeClean helps you review photos and videos quickly. Swipe right to keep, left to remove. Removed items go to Trash first, where you can restore them before they are permanently deleted.',
  },
  privacy: {
    title: 'Privacy Policy',
    message:
      'SwipeClean processes your photo library on your device. Your media is not uploaded to our servers for cleaning or review. Trash and settings preferences are stored locally on this device.',
  },
  terms: {
    title: 'Terms of Use',
    message:
      'SwipeClean is provided as-is for personal storage management. You are responsible for reviewing items before permanent deletion. Recovery options depend on your Recovery Vault setting in Settings.',
  },
};

export const ABOUT_LINKS: AboutLinkItem[] = [
  {
    id: 'how-it-works',
    label: 'How It Works',
    icon: 'compass-outline',
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: 'shield-outline',
  },
  {
    id: 'terms',
    label: 'Terms of Use',
    icon: 'document-text-outline',
  },
  {
    id: 'rate',
    label: 'Rate Us',
    icon: 'star-outline',
  },
];
