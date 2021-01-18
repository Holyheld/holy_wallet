import lang from 'i18n-js';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Linking } from 'react-native';
import { ContextCircleButton } from '../../context-menu';
import EditOptions from '@holyheld-com/helpers/editOptionTypes';
import {
  useAccountSettings,
  useCoinListEditOptions,
} from '@holyheld-com/hooks';
import { colors } from '@holyheld-com/styles';
import { ethereumUtils } from '@holyheld-com/utils';

export default function ChartContextButton({ asset }) {
  const {
    clearSelectedCoins,
    currentAction,
    pushSelectedCoin,
    setHiddenCoins,
    setPinnedCoins,
  } = useCoinListEditOptions();

  const { network } = useAccountSettings();
  const etherscanHost = ethereumUtils.getEtherscanHostFromNetwork(network);

  useEffect(() => {
    // Ensure this expanded state's asset is always actively inside
    // the CoinListEditOptions selection queue
    pushSelectedCoin(asset?.uniqueId);

    // Clear CoinListEditOptions selection queue on unmount.
    return () => clearSelectedCoins();
  }, [asset, clearSelectedCoins, currentAction, pushSelectedCoin]);

  const handleActionSheetPress = useCallback(
    buttonIndex => {
      if (buttonIndex === 0) {
        // 📌️ Pin
        setPinnedCoins();
      } else if (buttonIndex === 1) {
        // 🙈️ Hide
        setHiddenCoins();
      } else if (buttonIndex === 2 && asset?.address !== 'eth') {
        // 🔍 View on Etherscan
        Linking.openURL(`https://${etherscanHost}/token/${asset?.address}`);
      }
    },
    [asset?.address, etherscanHost, setHiddenCoins, setPinnedCoins]
  );

  const options = useMemo(
    () => [
      `📌️ ${currentAction === EditOptions.unpin ? 'Unpin' : 'Pin'}`,
      `🙈️ ${currentAction === EditOptions.unhide ? 'Unhide' : 'Hide'}`,
      ...(asset?.address === 'eth' ? [] : ['🔍 View on Etherscan']),
      ...(ios ? [lang.t('wallet.action.cancel')] : []),
    ],
    [asset?.address, currentAction]
  );

  return (
    <ContextCircleButton
      flex={0}
      onPressActionSheet={handleActionSheetPress}
      options={options}
      tintColor={colors.textColorPrimaryButton}
    />
  );
}
