import React, { useCallback } from 'react';
import isNativeStackAvailable from '../../../helpers/isNativeStackAvailable';
import { useExpandedStateNavigation } from '../../../hooks';
import SheetActionButton from './SheetActionButton';
import Routes from '@holyheld-com/routes';
import { colors } from '@holyheld-com/styles';

export default function SendActionButton({
  color = colors.paleBlue,
  textColor = colors.textColor,
  ...props
}) {
  const navigate = useExpandedStateNavigation();
  const handlePress = useCallback(
    () =>
      navigate(Routes.SEND_FLOW, params =>
        isNativeStackAvailable
          ? {
              params,
              screen: Routes.SEND_SHEET,
            }
          : { ...params }
      ),
    [navigate]
  );

  return (
    <SheetActionButton
      {...props}
      color={color}
      label="􀈠 Send"
      onPress={handlePress}
      testID="send"
      textColor={textColor}
      weight="bold"
    />
  );
}
