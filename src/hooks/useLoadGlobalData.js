import { useCallback } from 'react';
import { queryCache } from 'react-query';
import { useDispatch } from 'react-redux';
import {
  getTopMovers,
  TOP_MOVERS_FROM_STORAGE,
} from '@holyheld-com/handlers/localstorage/topMovers';
import {
  getWalletBalances,
  WALLET_BALANCES_FROM_STORAGE,
} from '@holyheld-com/handlers/localstorage/walletBalances';
import { contactsLoadState } from '@holyheld-com/redux/contacts';
import { imageMetadataCacheLoadState } from '@holyheld-com/redux/imageMetadata';
import { keyboardHeightsLoadState } from '@holyheld-com/redux/keyboardHeight';
import { settingsLoadState } from '@holyheld-com/redux/settings';
import { promiseUtils } from '@holyheld-com/utils';
import logger from 'logger';

const loadTopMoversToCache = () =>
  queryCache.prefetchQuery(TOP_MOVERS_FROM_STORAGE, getTopMovers);

const loadWalletBalanceNamesToCache = () =>
  queryCache.prefetchQuery(WALLET_BALANCES_FROM_STORAGE, getWalletBalances);

export default function useLoadGlobalData() {
  const dispatch = useDispatch();

  const loadGlobalData = useCallback(async () => {
    logger.sentry('Load wallet global data');
    const promises = [];
    const p1 = dispatch(settingsLoadState());
    const p2 = dispatch(contactsLoadState());
    const p3 = loadTopMoversToCache();
    const p4 = loadWalletBalanceNamesToCache();
    const p5 = dispatch(imageMetadataCacheLoadState());
    const p6 = dispatch(keyboardHeightsLoadState());
    promises.push(p1, p2, p3, p4, p5, p6);

    return promiseUtils.PromiseAllWithFails(promises);
  }, [dispatch]);

  return loadGlobalData;
}
