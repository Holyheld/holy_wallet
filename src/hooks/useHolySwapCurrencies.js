/* eslint-disable no-use-before-define */
import { useRoute } from '@react-navigation/native';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { useDispatch } from 'react-redux';
import currencySelectionTypes from '../helpers/currencySelectionTypes';
import { useNavigation } from '../navigation/Navigation';
import {
  multicallAddListeners,
  multicallUpdateOutdatedListeners,
} from '../redux/multicall';
import { delayNext } from './useMagicAutofocus';
import usePrevious from './usePrevious';
import { useAccountSettings, useUniswapCalls } from '.';
import Routes from '@holyheld-com/routes';
import { isNewValueForPath, logger } from '@holyheld-com/utils';

const isSameAsset = (currOne, currTwo) =>
  !isNewValueForPath(currOne, currTwo, 'address');

export default function useHolySwapCurrencies({
  defaultInputCurrency,
  defaultOutputCurrency,
  inputHeaderTitle,
  outputHeaderTitle,
}) {
  const { navigate, setParams, dangerouslyGetParent } = useNavigation();
  const {
    params: { blockInteractions },
  } = useRoute();
  const dispatch = useDispatch();
  const { chainId } = useAccountSettings();

  const [inputCurrency, setInputCurrency] = useState(defaultInputCurrency);
  const [outputCurrency, setOutputCurrency] = useState(defaultOutputCurrency);

  const { calls } = useUniswapCalls(inputCurrency, outputCurrency);

  const previousInputCurrency = usePrevious(inputCurrency);
  const previousOutputCurrency = usePrevious(outputCurrency);

  useEffect(() => {
    if (!inputCurrency || !outputCurrency || isEmpty(calls)) return;
    if (
      isSameAsset(inputCurrency, previousInputCurrency) &&
      isSameAsset(outputCurrency, previousOutputCurrency)
    ) {
      return;
    }

    dispatch(multicallAddListeners({ calls, chainId }));
    dispatch(multicallUpdateOutdatedListeners());
  }, [
    calls,
    chainId,
    dispatch,
    inputCurrency,
    outputCurrency,
    previousInputCurrency,
    previousOutputCurrency,
  ]);

  const updateInputCurrency = useCallback(
    async (newInputCurrency, userSelected = true) => {
      logger.log(
        '[update input curr] new input curr, user selected?',
        newInputCurrency,
        userSelected
      );

      logger.log('[update input curr] prev input curr', previousInputCurrency);
      setInputCurrency(newInputCurrency);

      if (userSelected && isSameAsset(newInputCurrency, outputCurrency)) {
        logger.log(
          '[update input curr] setting output curr to prev input curr'
        );

        updateOutputCurrency(previousInputCurrency, false);
      }
    },
    [outputCurrency, previousInputCurrency, updateOutputCurrency]
  );

  const updateOutputCurrency = useCallback(
    async (newOutputCurrency, userSelected = true) => {
      logger.log(
        '[update output curr] new output curr, user selected?',
        newOutputCurrency,
        userSelected
      );

      logger.log(
        '[update output curr] prev output curr',
        previousOutputCurrency
      );

      setOutputCurrency(newOutputCurrency);

      logger.log('existsInWallet?');
      logger.log(userSelected);
      logger.log(isSameAsset(inputCurrency, newOutputCurrency));

      if (userSelected && isSameAsset(inputCurrency, newOutputCurrency)) {
        logger.log('[update output curr] updating input curr with nothing');
        updateInputCurrency(null, false);
      }
    },
    [inputCurrency, previousOutputCurrency, updateInputCurrency]
  );

  const navigateToSelectInputCurrency = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      dangerouslyGetParent().dangerouslyGetState().index = 0;
      setParams({ focused: false });
      delayNext();
      navigate(Routes.CURRENCY_SELECT_SCREEN, {
        headerTitle: inputHeaderTitle,
        onSelectCurrency: updateInputCurrency,
        restoreFocusOnSwapModal: () => setParams({ focused: true }),
        type: currencySelectionTypes.input,
      });
      blockInteractions();
    });
  }, [
    blockInteractions,
    dangerouslyGetParent,
    inputHeaderTitle,
    navigate,
    setParams,
    updateInputCurrency,
  ]);

  const navigateToSelectOutputCurrency = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      dangerouslyGetParent().dangerouslyGetState().index = 0;
      setParams({ focused: false });
      delayNext();
      navigate(Routes.CURRENCY_SELECT_SCREEN, {
        headerTitle: outputHeaderTitle,
        onSelectCurrency: updateOutputCurrency,
        restoreFocusOnSwapModal: () => setParams({ focused: true }),
        type: currencySelectionTypes.output,
      });
      blockInteractions();
    });
  }, [
    dangerouslyGetParent,
    setParams,
    navigate,
    outputHeaderTitle,
    updateOutputCurrency,
    blockInteractions,
  ]);

  return {
    inputCurrency,
    navigateToSelectInputCurrency,
    navigateToSelectOutputCurrency,
    outputCurrency,
    previousInputCurrency,
    previousOutputCurrency,
  };
}
