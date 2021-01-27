import { useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';
import currencySelectionTypes from '../helpers/currencySelectionTypes';
import { useNavigation } from '../navigation/Navigation';
import { delayNext } from './useMagicAutofocus';
import usePrevious from './usePrevious';
import Routes from '@holyheld-com/routes';
import { logger } from '@holyheld-com/utils';

export default function useHolyWithdrawCurrencies({ defaultOutputCurrency }) {
  const { navigate, setParams, dangerouslyGetParent } = useNavigation();
  const {
    params: { blockInteractions },
  } = useRoute();

  const [outputCurrency, setOutputCurrency] = useState(defaultOutputCurrency);
  const previousOutputCurrency = usePrevious(outputCurrency);

  const updateOutputCurrency = useCallback(
    (newOutputCurrency, userSelected = true) => {
      logger.log(
        '[update output curr] new output curr, user selected?',
        newOutputCurrency,
        userSelected
      );

      setOutputCurrency(newOutputCurrency);

      logger.log(
        '[update output curr] prev output curr',
        previousOutputCurrency
      );
    },
    [previousOutputCurrency]
  );

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
    navigateToSelectOutputCurrency,
    outputCurrency,
    previousOutputCurrency,
  };
}
