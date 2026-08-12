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

export const ABOUT_LINKS: AboutLinkItem[] = [
  {
    id: 'how-it-works',
    label: 'How It Works',
    icon: 'compass-outline',
    url: 'https://swipeclean.app/how-it-works',
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: 'shield-outline',
    url: 'https://swipeclean.app/privacy',
  },
  {
    id: 'terms',
    label: 'Terms of Use',
    icon: 'document-text-outline',
    url: 'https://swipeclean.app/terms',
  },
  {
    id: 'rate',
    label: 'Rate Us',
    icon: 'star-outline',
  },
];
