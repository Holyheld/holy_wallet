import analytics from '@segment/analytics-react-native';
import React, { useCallback } from 'react';

import SheetActionButton from './SheetActionButton';
import showWalletErrorAlert from '@holyheld-com/helpers/support';
import { useExpandedStateNavigation, useWallets } from '@holyheld-com/hooks';

import Routes from '@holyheld-com/routes';
import { colors } from '@holyheld-com/styles';

export default function BuyActionButton({ color = colors.paleBlue, ...props }) {
  const navigate = useExpandedStateNavigation();
  const { isDamaged } = useWallets();

  const handlePress = useCallback(() => {
    if (isDamaged) {
      showWalletErrorAlert();
      return;
    }

    if (ios) {
      navigate(Routes.ADD_CASH_FLOW, params => params);
    } else {
      navigate(Routes.WYRE_WEBVIEW, params => params);
    }

    analytics.track('Tapped Buy more ETH', {
      category: 'add cash',
    });
  }, [navigate, isDamaged]);

  return (
    <SheetActionButton
      {...props}
      color={color}
      label="􀍰 Buy more ETH"
      onPress={handlePress}
      weight="bold"
    />
  );
}
