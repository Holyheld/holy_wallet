import { useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';
import currencySelectionTypes from '../helpers/currencySelectionTypes';
import { useNavigation } from '../navigation/Navigation';
import { delayNext } from './useMagicAutofocus';
import usePrevious from './usePrevious';
import Routes from '@holyheld-com/routes';
import { logger } from '@holyheld-com/utils';

export default function useHolyDepositCurrencies({
  defaultInputCurrency,
  inputHeaderTitle,
}) {
  const { navigate, setParams, dangerouslyGetParent } = useNavigation();
  const {
    params: { blockInteractions },
  } = useRoute();

  const [inputCurrency, setInputCurrency] = useState(defaultInputCurrency);
  const [outputSaving, setOutputSaving] = useState(null);

  const previousOutputSaving = usePrevious(outputSaving);
  const previousInputCurrency = usePrevious(inputCurrency);

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

  const updateOutputSaving = useCallback(
    (newOutputSaving, userSelected = true) => {
      logger.log(
        '[update output saving] new output saving, user selected?',
        newOutputSaving,
        userSelected
      );
      logger.log(
        '[update output saving] input curr at the moment',
        inputCurrency
      );

      setOutputSaving(newOutputSaving);

      logger.log(
        '[update output saving] prev output saving',
        previousOutputSaving
      );
    },
    [inputCurrency, previousOutputSaving]
  );

  const navigateToSelectInputCurrency = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      dangerouslyGetParent().dangerouslyGetState().index = 0;
      setParams({ focused: false });
      delayNext();
      navigate(Routes.CURRENCY_SELECT_SCREEN, {
        headerTitle: inputHeaderTitle,
        onSelectSaving: updateInputCurrency,
        restoreFocusOnSwapModal: () => setParams({ focused: true }),
        type: currencySelectionTypes.output,
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

  const navigateToSelectOutputSaving = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      setParams({ focused: false });
      dangerouslyGetParent().dangerouslyGetState().index = 0;
      delayNext();
      navigate(Routes.CURRENCY_SELECT_SCREEN, {
        category: 'holy savings',
        headerTitle: 'Deposite',
        onSelectSaving: updateOutputSaving,
        restoreFocusOnSwapModal: () => setParams({ focused: true }),
        type: currencySelectionTypes.output,
        useHolySavingsSelect: true,
      });
      blockInteractions();
    });
  }, [
    blockInteractions,
    dangerouslyGetParent,
    navigate,
    setParams,
    updateOutputSaving,
  ]);

  return {
    inputCurrency,
    navigateToSelectInputCurrency,
    navigateToSelectOutputSaving,
    outputSaving,
    previousInputCurrency,
  };
}
