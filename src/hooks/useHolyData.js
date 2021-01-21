import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { multiply } from '../helpers/utilities';

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

export function useHHToken() {
  const HHTokenPrice = useSelector(state => state.holy.prices.HH);
  return {
    HHTokenPrice,
  };
}

export function useHolyEarlyLPBonus() {
  const earlyLPBonus = useSelector(state => state.holy.earlyLPBonus);
  const hhNativePrice = useSelector(state => state.holy.prices.HH.inNative);

  const nativeAmountToclaim = multiply(
    hhNativePrice,
    earlyLPBonus.amountToClaim
  );

  const nativeFullCap = multiply(hhNativePrice, earlyLPBonus.fullCap);

  const dpyAmount = multiply(
    earlyLPBonus.fullCap,
    new BigNumber(earlyLPBonus.dpy).shiftedBy(-2)
  );

  const dpyNativeAmount = multiply(hhNativePrice, dpyAmount);

  return {
    ...earlyLPBonus,
    dpyAmount,
    dpyNativeAmount,
    hhNativePrice,
    nativeAmountToclaim,
    nativeFullCap,
  };
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
