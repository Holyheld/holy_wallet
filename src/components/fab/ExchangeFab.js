import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { USE_HOLY_SWAP } from '../../config/experimental';
import { useNavigation } from '../../navigation/Navigation';
import { magicMemo } from '../../utils';
import { Icon } from '../icons';
import FloatingActionButton from './FloatingActionButton';
import Routes from '@holyheld-com/routes';
import { colors } from '@holyheld-com/styles';

const FabShadow = [
  [0, 10, 30, colors.shadowDarker, 0.4],
  [0, 5, 15, colors.swapPurple, 0.5],
];

const ExchangeFab = ({ disabled, isReadOnlyWallet, ...props }) => {
  const { navigate } = useNavigation();

  const handlePress = useCallback(() => {
    if (!isReadOnlyWallet) {
      if (!USE_HOLY_SWAP) {
        navigate(Routes.EXCHANGE_MODAL);
      } else {
        navigate(Routes.HOLY_SWAP_MODAL, {
          params: {
            screen: Routes.MAIN_EXCHANGE_SCREEN,
          },
          screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
        });
      }
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [navigate, isReadOnlyWallet]);

  return (
    <FloatingActionButton
      {...props}
      backgroundColor={colors.swapPurple}
      disabled={disabled}
      onPress={handlePress}
      shadows={FabShadow}
      testID="exchange-fab"
    >
      <Icon height={21} marginBottom={2} name="swap" width={26} />
    </FloatingActionButton>
  );
};

export default magicMemo(ExchangeFab, ['disabled', 'isReadOnlyWallet']);
