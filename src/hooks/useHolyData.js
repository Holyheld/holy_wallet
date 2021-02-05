import BigNumber from 'bignumber.js';
import { useSelector } from 'react-redux';
import { multiply } from '../helpers/utilities';

export function useHolySavings() {
  const savings = useSelector(state => state.holy.savings);
  return savings;
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
  const hhEthPrice = useSelector(state => state.holy.prices.HH.inEth);

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
    hhEthPrice,
    hhNativePrice,
    nativeAmountToclaim,
    nativeFullCap,
  };
}

export function useHolyTreasury() {
  const treasury = useSelector(state => state.holy.treasury);
  return treasury;
}
