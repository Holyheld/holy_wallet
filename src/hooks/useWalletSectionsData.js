import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { buildWalletSectionsSelector } from '../helpers/buildWalletSections';
import { readableUniswapSelector } from '../hoc/uniswapLiquidityTokenInfoSelector';
import useAccountAssets from './useAccountAssets';
import useAccountSettings from './useAccountSettings';
import useCoinListEditOptions from './useCoinListEditOptions';
import { useHolyEarlyLPBonus, useHolySavings } from './useHolySavings';
import useIsWalletEthZero from './useIsWalletEthZero';
import useSavingsAccount from './useSavingsAccount';
import useSendableUniqueTokens from './useSendableUniqueTokens';
import useShowcaseTokens from './useShowcaseTokens';

export default function useWalletSectionsData() {
  const accountData = useAccountAssets();
  const isWalletEthZero = useIsWalletEthZero();

  const { language, network, nativeCurrency } = useAccountSettings();
  const uniqueTokens = useSendableUniqueTokens();
  const uniswap = useSelector(readableUniswapSelector);
  const { showcaseTokens } = useShowcaseTokens();
  const holySavings = useHolySavings();
  const holyEarlyBonus = useHolyEarlyLPBonus();

  const {
    currentAction,
    hiddenCoins,
    isCoinListEdited,
    pinnedCoins,
  } = useCoinListEditOptions();

  const { refetchSavings, shouldRefetchSavings } = useSavingsAccount(true);

  const walletSections = useMemo(() => {
    let holyTreasury = [{}];
    const accountInfo = {
      currentAction,
      hiddenCoins,
      holyEarlyBonus,
      holySavings,
      holyTreasury,
      isCoinListEdited,
      language,
      nativeCurrency,
      network,
      pinnedCoins,
      ...accountData,
      ...uniqueTokens,
      ...uniswap,
      ...isWalletEthZero,
      showcaseTokens,
    };

    const sectionsData = buildWalletSectionsSelector(accountInfo);

    return {
      isWalletEthZero,
      refetchSavings,
      shouldRefetchSavings,
      ...sectionsData,
    };
  }, [
    accountData,
    currentAction,
    holyEarlyBonus,
    holySavings,
    hiddenCoins,
    isCoinListEdited,
    isWalletEthZero,
    language,
    nativeCurrency,
    network,
    pinnedCoins,
    refetchSavings,
    shouldRefetchSavings,
    showcaseTokens,
    uniqueTokens,
    uniswap,
  ]);
  return walletSections;
}
