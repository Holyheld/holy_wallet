import React, { useCallback } from 'react';
import { USE_HOLY_SWAP } from '../../../config/experimental';
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
  const handlePress = useCallback(() => {
    if (!USE_HOLY_SWAP) {
      return navigate(Routes.EXCHANGE_MODAL, params => ({
        params: {
          params,
          screen: Routes.MAIN_EXCHANGE_SCREEN,
        },
        screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
      }));
    } else {
      return navigate(Routes.HOLY_SWAP_MODAL, params => ({
        params: {
          params,
          screen: Routes.MAIN_EXCHANGE_SCREEN,
        },
        screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
      }));
    }
  }, [navigate]);

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
