import type { StyleProp, TextStyle } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { formatBytes } from '@/utils/formatBytes';

interface FormattedBytesProps {
  bytes: number;
  decimals?: number;
  style?: StyleProp<TextStyle>;
}

/** Renders a byte size on one line (e.g. "63.0 MB"). */
export function FormattedBytes({ bytes, decimals, style }: FormattedBytesProps) {
  return (
    <Text
      adjustsFontSizeToFit
      minimumFontScale={0.85}
      numberOfLines={1}
      style={[styles.text, style]}
    >
      {formatBytes(bytes, decimals).replace('\u00A0', ' ')}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    minWidth: 0,
  },
});
