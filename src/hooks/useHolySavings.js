import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

const holySavingsTokens = state => state.holy.savingsTokens;
const holyEarlyLPBonus = state => state.holy.earlyLPBonus;
const holyBonusRate = state => state.holy.bonusRate;

const withSavings = holySavingsTokens => {
  return holySavingsTokens;
};

const withEarlyLPBonus = holyEarlyLPBonus => {
  return { bonus: holyEarlyLPBonus };
};

const withBonusRate = bonusRate => {
  return { bonusRate };
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

const withHolyBonusRateSelector = createSelector(
  [holyBonusRate],
  withBonusRate
);

export function useHolySavings() {
  return useSelector(withHolySavingsSelector);
}

export function useHolyEarlyLPBonus() {
  return useSelector(withHolyEarlyLPBonusSelector);
}

export function useHolyBonusRate() {
  return useSelector(withHolyBonusRateSelector);
}

export function useHolySavingsWithBalance() {
  return useSelector(withHolySavingsAssetsInWalletSelector);
}
