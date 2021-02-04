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

export default function useHolyDepositCurrencies({
  defaultInputCurrency,
  outputCurrency,
  inputHeaderTitle,
}) {
  const { navigate, setParams, dangerouslyGetParent } = useNavigation();
  const {
    params: { blockInteractions },
  } = useRoute();
  const dispatch = useDispatch();
  const { chainId } = useAccountSettings();

  const [inputCurrency, setInputCurrency] = useState(defaultInputCurrency);
  const { calls } = useUniswapCalls(inputCurrency, outputCurrency);

  const previousInputCurrency = usePrevious(inputCurrency);

  useEffect(() => {
    if (!inputCurrency || isEmpty(calls)) return;
    if (isSameAsset(inputCurrency, previousInputCurrency)) return;

    dispatch(multicallAddListeners({ calls, chainId }));
    dispatch(multicallUpdateOutdatedListeners());
  }, [calls, chainId, dispatch, inputCurrency, previousInputCurrency]);

  const updateInputCurrency = useCallback(
    async (newInputCurrency, userSelected = true) => {
      logger.log(
        '[update input curr] new input curr, user selected?',
        newInputCurrency,
        userSelected
      );

      logger.log('[update input curr] prev input curr', previousInputCurrency);

      setInputCurrency(newInputCurrency);
    },
    [previousInputCurrency]
  );

  const navigateToSelectInputCurrency = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      dangerouslyGetParent().dangerouslyGetState().index = 0;
      setParams({ focused: false });
      delayNext();
      navigate(Routes.CURRENCY_SELECT_SCREEN, {
        headerTitle: inputHeaderTitle,
        holyCompatibility: true,
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

  return {
    inputCurrency,
    navigateToSelectInputCurrency,
    previousInputCurrency,
  };
}
