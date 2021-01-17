import React, { useCallback } from 'react';
import { useExpandedStateNavigation } from '../../../hooks';
import SheetActionButton from './SheetActionButton';
import Routes from '@holyheld-com/routes';
import { colors } from '@holyheld-com/styles';

export default function SwapActionButton({
  color = colors.swapPurple,
  textColor = colors.textColor,
  inputType,
  ...props
}) {
  const navigate = useExpandedStateNavigation(inputType);
  const handlePress = useCallback(
    () =>
      navigate(Routes.EXCHANGE_MODAL, params => ({
        params: {
          params,
          screen: Routes.MAIN_EXCHANGE_SCREEN,
        },
        screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
      })),
    [navigate]
  );

  return (
    <SheetActionButton
      {...props}
      color={color}
      label="􀖅 Swap"
      onPress={handlePress}
      testID="swap"
      textColor={textColor}
      weight="bold"
    />
  );
}
