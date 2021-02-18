import { captureException } from '@sentry/react-native';
import delay from 'delay';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  refreshHHinWETHPrice,
  refreshHHNativePrice,
  refreshHoly,
} from '../handlers/holy';
import NetworkTypes from '../helpers/networkTypes';
import { explorerInit } from '../redux/explorer';
import { uniqueTokensRefreshState } from '../redux/uniqueTokens';
import { uniswapUpdateLiquidityState } from '../redux/uniswapLiquidity';
import { fetchWalletNames } from '../redux/wallets';
import useAccountSettings from './useAccountSettings';
import useSavingsAccount from './useSavingsAccount';

import logger from 'logger';

export default function useRefreshAccountData() {
  const dispatch = useDispatch();
  const { network } = useAccountSettings();
  const { refetchSavings } = useSavingsAccount();

  const refreshAccountData = useCallback(async () => {
    const getHoly = dispatch(refreshHoly());
    const getHHNativePrice = dispatch(refreshHHNativePrice());

    // Refresh unique tokens for Rinkeby
    if (network === NetworkTypes.rinkeby) {
      const getUniqueTokens = dispatch(uniqueTokensRefreshState());
      return Promise.all([delay(1250), getUniqueTokens]);
    }

    // Nothing to refresh for other testnets
    if (network !== NetworkTypes.mainnet) {
      await dispatch(refreshHHinWETHPrice());
      return Promise.all([delay(1250), getHoly, getHHNativePrice]);
    }

    try {
      await dispatch(refreshHHinWETHPrice());
      const getWalletNames = dispatch(fetchWalletNames());
      const getUniswapLiquidity = dispatch(uniswapUpdateLiquidityState());
      const getUniqueTokens = dispatch(uniqueTokensRefreshState());
      const explorer = dispatch(explorerInit());

      return Promise.all([
        delay(1250), // minimum duration we want the "Pull to Refresh" animation to last
        getWalletNames,
        getUniswapLiquidity,
        getUniqueTokens,
        getHHNativePrice,
        refetchSavings(true),
        explorer,
        getHoly,
      ]);
    } catch (error) {
      logger.log('Error refreshing data', error);
      captureException(error);
      throw error;
    }
  }, [dispatch, network, refetchSavings]);

  return refreshAccountData;
}
