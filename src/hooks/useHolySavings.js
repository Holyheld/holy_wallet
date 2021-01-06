import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

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
