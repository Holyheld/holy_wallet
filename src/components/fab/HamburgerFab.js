import React, { useCallback } from 'react';
import { magicMemo } from '../../utils';
import { Icon } from '../icons';
import FloatingActionButton from './FloatingActionButton';
import { useNavigation } from '@rainbow-me/navigation';
import Routes from '@rainbow-me/routes';
import { colors } from '@rainbow-me/styles';

const FabShadow = [
  [0, 10, 30, colors.transparent, 0.4],
  [0, 5, 15, colors.transparent, 0.5],
];

const HamburgerFab = ({ disabled, ...props }) => {
  const { navigate } = useNavigation();

  const handlePress = useCallback(() => {
    navigate(Routes.HAMBURGER_SHEET);
  }, [navigate]);

  return (
    <FloatingActionButton
      {...props}
      backgroundColor={colors.buttonSecondary}
      disabled={disabled}
      onPress={handlePress}
      shadows={FabShadow}
      testID="exchange-fab"
    >
      <Icon
        color={colors.textColorSecondaryButton}
        height={21}
        marginBottom={2}
        name="hamburger"
        width={26}
      />
    </FloatingActionButton>
  );
};

export default magicMemo(HamburgerFab, ['disabled', 'isReadOnlyWallet']);
