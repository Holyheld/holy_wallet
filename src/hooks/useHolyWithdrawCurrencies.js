import { useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';
import currencySelectionTypes from '../helpers/currencySelectionTypes';
import { useNavigation } from '../navigation/Navigation';
import { delayNext } from './useMagicAutofocus';
import usePrevious from './usePrevious';
import Routes from '@rainbow-me/routes';
import { logger } from '@rainbow-me/utils';

export default function useHolyWithdrawCurrencies({
  defaultInputSaving,
  defaultOutputCurrency,
  inputHeaderTitle,
}) {
  const { navigate, setParams, dangerouslyGetParent } = useNavigation();
  const {
    params: { blockInteractions },
  } = useRoute();

  const [inputSaving, setInputSaving] = useState(defaultInputSaving);
  const [outputCurrency, setOutputCurrency] = useState(defaultOutputCurrency);

  const previousOutputCurrency = usePrevious(outputCurrency);
  const previousInputSaving = usePrevious(inputSaving);

  const updateInputSaving = useCallback(
    async (newInputSaving, userSelected = true) => {
      logger.log(
        '[update input saving] new input saving, user selected?',
        newInputSaving,
        userSelected
      );

      logger.log(
        '[update input saving] prev input saving',
        previousInputSaving
      );

      setInputSaving(newInputSaving);
    },
    [previousInputSaving]
  );

  const updateOutputCurrency = useCallback(
    (newOutputCurrency, userSelected = true) => {
      logger.log(
        '[update output curr] new output curr, user selected?',
        newOutputCurrency,
        userSelected
      );
      logger.log(
        '[update output curr] input savings at the moment',
        inputSaving
      );

      setOutputCurrency(newOutputCurrency);

      logger.log(
        '[update output curr] prev output curr',
        previousOutputCurrency
      );
    },
    [inputSaving, previousOutputCurrency]
  );

  const navigateToSelectInputSaving = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      dangerouslyGetParent().dangerouslyGetState().index = 0;
      setParams({ focused: false });
      delayNext();
      navigate(Routes.CURRENCY_SELECT_SCREEN, {
        headerTitle: inputHeaderTitle,
        onSelectSaving: updateInputSaving,
        restoreFocusOnSwapModal: () => setParams({ focused: true }),
        type: currencySelectionTypes.input,
        useHolySavingsSelect: true,
      });
      blockInteractions();
    });
  }, [
    blockInteractions,
    dangerouslyGetParent,
    inputHeaderTitle,
    navigate,
    setParams,
    updateInputSaving,
  ]);

  const navigateToSelectOutputCurrency = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      setParams({ focused: false });
      dangerouslyGetParent().dangerouslyGetState().index = 0;
      delayNext();
      navigate(Routes.CURRENCY_SELECT_SCREEN, {
        category: 'holy savings',
        headerTitle: 'Receive',
        onSelectCurrency: updateOutputCurrency,
        restoreFocusOnSwapModal: () => setParams({ focused: true }),
        type: currencySelectionTypes.output,
        useHolySavingsSelect: false,
      });
      blockInteractions();
    });
  }, [
    blockInteractions,
    dangerouslyGetParent,
    navigate,
    setParams,
    updateOutputCurrency,
  ]);

  return {
    inputSaving,
    navigateToSelectInputSaving,
    navigateToSelectOutputCurrency,
    outputCurrency,
    previousInputSaving,
  };
}
