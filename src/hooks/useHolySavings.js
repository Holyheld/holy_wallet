import { useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { InteractionManager } from 'react-native';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { useNavigation } from '../navigation/Navigation';
import { delayNext } from './useMagicAutofocus';
import usePrevious from './usePrevious';
import Routes from '@rainbow-me/routes';
import { logger } from '@rainbow-me/utils';

const holySavingsTokens = state => state.holy.savingsTokens;

const withSavings = holySavingsTokens => {
  return holySavingsTokens;
};

const withSavingsAssetsInWallet = holySavingsTokens => {
  return holySavingsTokens.filter(saving => saving.balance !== '0');
};

const withHolySavingsSelector = createSelector(
  [holySavingsTokens],
  withSavings
);

const withHolySavingsAssetsInWalletSelector = createSelector(
  [holySavingsTokens],
  withSavingsAssetsInWallet
);

export function useHolySavings() {
  return useSelector(withHolySavingsSelector);
}

export function useHolySavingsWithBalance() {
  return useSelector(withHolySavingsAssetsInWalletSelector);
}

export default function useSavingsWithBalanceWithSelections({
  defaultInputSaving,
  inputHeaderTitle,
}) {
  const { navigate, setParams, dangerouslyGetParent } = useNavigation();
  const {
    params: { blockInteractions },
  } = useRoute();

  const [inputSaving, setInputSaving] = useState(defaultInputSaving);

  const previousInputCurrency = usePrevious(inputSaving);

  const updateInputSaving = useCallback(
    async (newInputCurrency, userSelected = true) => {
      logger.log(
        '[update input saving] new input saving, user selected?',
        newInputCurrency,
        userSelected
      );

      logger.log('[update input curr] prev input curr', previousInputCurrency);

      setInputSaving(newInputCurrency);
    },
    [previousInputCurrency]
  );

  const navigateToSelectInputSaving = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      dangerouslyGetParent().dangerouslyGetState().index = 0;
      setParams({ focused: false });
      delayNext();
      navigate(Routes.HOLY_SAVINGS_SELECT_SCREEN, {
        headerTitle: inputHeaderTitle,
        onSelectSaving: updateInputSaving,
        restoreFocusOnSwapModal: () => setParams({ focused: true }),
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

  return {
    inputSaving,
    navigateToSelectInputSaving,
  };
}
