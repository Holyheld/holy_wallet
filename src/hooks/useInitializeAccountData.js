import { captureException } from '@sentry/react-native';
import { useCallback } from 'react';
import { InteractionManager } from 'react-native';
import { useDispatch } from 'react-redux';
import {
  refreshHHinWETHPrice,
  refreshHHNativePrice,
  refreshHoly,
} from '../handlers/holy';
import { explorerInit } from '../redux/explorer';
import { getInitialGasPrices } from '../redux/gas';
import { uniqueTokensRefreshState } from '../redux/uniqueTokens';
import { uniswapGetAllExchanges, uniswapPairsInit } from '../redux/uniswap';
import logger from 'logger';

export default function useInitializeAccountData() {
  const dispatch = useDispatch();

  const initializeAccountData = useCallback(async () => {
    try {
      InteractionManager.runAfterInteractions(async () => {
        logger.sentry('Initialize holy data');
        dispatch(refreshHoly());
      });

      InteractionManager.runAfterInteractions(async () => {
        logger.sentry('Initialize HH in ETH price');
        await dispatch(refreshHHinWETHPrice());
        logger.sentry('Initialize HH native price');
        dispatch(refreshHHNativePrice());
        logger.sentry('Initialize account data');
        dispatch(explorerInit());
      });

      InteractionManager.runAfterInteractions(async () => {
        logger.sentry('Initialize uniswapPairsInit & getAllExchanges');
        dispatch(uniswapPairsInit());
        await dispatch(uniswapGetAllExchanges());
      });

      InteractionManager.runAfterInteractions(async () => {
        logger.sentry('Initialize uniqueTokens');
        await dispatch(uniqueTokensRefreshState());
      });

      InteractionManager.runAfterInteractions(async () => {
        logger.sentry('Initialize first gas prices');
        await dispatch(getInitialGasPrices());
      });
    } catch (error) {
      logger.sentry('Error initializing account data');
      captureException(error);
    }
  }, [dispatch]);

  return initializeAccountData;
}
