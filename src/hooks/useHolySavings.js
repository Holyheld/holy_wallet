import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

const holySavingsTokens = state => state.holy.savingsTokens;
const holyBonusRate = state => state.holy.bonusRate;

const withSavings = holySavingsTokens => {
  return holySavingsTokens;
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

const withHolyBonusRateSelector = createSelector(
  [holyBonusRate],
  withBonusRate
);

export function useHolySavings() {
  return useSelector(withHolySavingsSelector);
}

export function useHolyEarlyLPBonus() {
  const earlyLPBonus = useSelector(state => state.holy.earlyLPBonus);
  return earlyLPBonus;
}

export function useHolyTreasury() {
  const treasury = useSelector(state => state.holy.treasury);
  return treasury;
}

export function useHolyBonusRate() {
  return useSelector(withHolyBonusRateSelector);
}

export function useHolySavingsWithBalance() {
  return useSelector(withHolySavingsAssetsInWalletSelector);
}
