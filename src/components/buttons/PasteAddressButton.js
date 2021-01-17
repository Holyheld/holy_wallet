import React, { useCallback, useEffect, useState } from 'react';
import colors from '../../styles/colors';
import { Text } from '../text';
import MiniButton from './MiniButton';
import { checkIsValidAddressOrENS } from '@holyheld-com/helpers/validators';
import { useClipboard, useInvalidPaste } from '@holyheld-com/hooks';
import { deviceUtils } from '@holyheld-com/utils';

export default function PasteAddressButton({
  onPress,
  textColor = colors.textColorPrimaryButton,
  textColorDisabled = colors.textColorSecondaryButton,
}) {
  const [isValid, setIsValid] = useState(false);
  const { onInvalidPaste } = useInvalidPaste();
  const {
    clipboard,
    enablePaste,
    getClipboard,
    hasClipboardData,
  } = useClipboard();

  useEffect(() => {
    async function validate() {
      const isValidAddress = await checkIsValidAddressOrENS(clipboard);
      setIsValid(isValidAddress);
    }

    if (!deviceUtils.isIOS14) {
      validate();
    }
  }, [clipboard]);

  const handlePress = useCallback(() => {
    if (!enablePaste) return;

    getClipboard(async clipboardData => {
      const isValidAddress = await checkIsValidAddressOrENS(clipboardData);

      if (isValidAddress) {
        return onPress?.(clipboardData);
      }

      return onInvalidPaste();
    });
  }, [enablePaste, getClipboard, onInvalidPaste, onPress]);

  const isDisabled = deviceUtils.isIOS14
    ? !hasClipboardData
    : clipboard && !isValid;

  return (
    <MiniButton
      disabled={isDisabled}
      onPress={handlePress}
      testID="paste-address-button"
      {...(android && { height: 30, overflowMargin: 15, width: 60 })}
    >
      <Text
        color={isDisabled ? textColorDisabled : textColor}
        weight="semibold"
      >
        Paste
      </Text>
    </MiniButton>
  );
}
