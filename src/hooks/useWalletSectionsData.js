import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { buildWalletSectionsSelector } from '../helpers/buildWalletSections';
import { readableUniswapSelector } from '../hoc/uniswapLiquidityTokenInfoSelector';
import useAccountAssets from './useAccountAssets';
import useAccountSettings from './useAccountSettings';
import useCoinListEditOptions from './useCoinListEditOptions';
import { useHolySavings } from './useHolySavings';
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

  const {
    currentAction,
    hiddenCoins,
    isCoinListEdited,
    pinnedCoins,
  } = useCoinListEditOptions();

  const { refetchSavings, shouldRefetchSavings } = useSavingsAccount(true);

  // console.log('uniswap');
  // console.log(uniswap);

  const walletSections = useMemo(() => {
    // TODO: get data from network
    /*let holySavings = [
      {

        apy: '2.96',
        balance:"10",
        underlying: {
          symbol: 'yUSD',
          address: '0x6b175474e89094c44da98b954eedeac495271d0f', // TODO: real address
        },
      },
      {
        apy: '4.96',
        balance:"44",
        underlying: {
          symbol: 'yCRV',
          address: '0x6b175474e89094c44da98b954eedeac495271d0f', // TODO: real address
        },
      },
      {
        apy: '10',
        balance:"55",
        underlying: {
          symbol: '3CRV',
          address: '0x6b175474e89094c44da98b954eedeac495271d0f', // TODO: real address
        },
      }
    ];*/

    let holyTreasury = [{}];
    let holyEarlyBonus = [{}];
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
