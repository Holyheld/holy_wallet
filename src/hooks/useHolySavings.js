import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

const holySavingsTokens = state => state.holy.savingsTokens;
const holyEarlyLPBonus = state => state.holy.earlyLPBonus;

const withSavings = holySavingsTokens => {
  return holySavingsTokens;
};

const withEarlyLPBonus = holyEarlyLPBonus => {
  return { bonus: holyEarlyLPBonus };
};

const withSavingsAssetsInWallet = holySavingsTokens => {
  return holySavingsTokens
    .filter(saving => saving.balance !== '0')
    .map(saving => {
      return {
        ...saving,
        address: saving.underlying.address,
        name: saving.underlying.symbol,
        native: {
          ...saving.native,
          balance: {
            display: saving.balance,
          },
        },
        symbol: saving.underlying.symbol,
      };
    });
};

const withHolySavingsSelector = createSelector(
  [holySavingsTokens],
  withSavings
);

const withHolySavingsAssetsInWalletSelector = createSelector(
  [holySavingsTokens],
  withSavingsAssetsInWallet
);

const withHolyEarlyLPBonusSelector = createSelector(
  [holyEarlyLPBonus],
  withEarlyLPBonus
);

export function useHolySavings() {
  return useSelector(withHolySavingsSelector);
}

export function useHolyEarlyLPBonus() {
  return useSelector(withHolyEarlyLPBonusSelector);
}

export function useHolySavingsWithBalance() {
  return useSelector(withHolySavingsAssetsInWalletSelector);
}
