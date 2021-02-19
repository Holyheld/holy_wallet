import { get } from 'lodash';
import React, { useMemo } from 'react';
import { Alert, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import styled from 'styled-components/primitives';
import { USE_HOLY_SWAP } from '../../config/experimental';
import networkInfo from '../../helpers/networkInfo';
import networkTypes from '../../helpers/networkTypes';
import { greaterThan } from '../../helpers/utilities';
import {
  useHolyEarlyLPBonus,
  useHolySavings,
  useHolyTreasury,
} from '../../hooks/useHolyData';
import useOpenLPBonus from '../../hooks/useOpenLPBonus';
import useOpenTreasuryBank from '../../hooks/useOpenTreasuryBank';
import {
  SavingsSheetEmptyHeight,
  SavingsSheetHeight,
} from '../../screens/HolySavingsSheet';
import { TreasurySheetHeight } from '../../screens/TreasurySheet';
import { Column } from '../layout';
import { ListItemDivider } from '../list';
import TreasurySheetEmptyState from '../treasury-bank/TreasurySheetEmptyState';
import NavigationRow from './NavigationRow';
import { useAccountSettings, useOpenSavings } from '@holyheld-com/hooks';
import { useNavigation } from '@holyheld-com/navigation';
import Routes from '@holyheld-com/routes';
import { colors } from '@holyheld-com/styles';

const listTopPadding = 7.5;
const rowHeight = 59;
const listPaddingBottom = 6;
const NOOP = () => undefined;

const getItemLayout = (data, index) => {
  const { height } = data[index];
  return {
    index,
    length: height,
    offset: height * index,
  };
};

const keyExtractor = item => `nav-${item.id}`;

const Container = styled(View).attrs({
  backgroundColor: colors.modalBackground,
})`
  height: ${({ height }) => height};
  margin-top: -2;
`;

const NavigationFlatList = styled(FlatList).attrs(({ showDividers }) => ({
  contentContainerStyle: {
    paddingBottom: showDividers ? 9.5 : 0,
    paddingTop: listTopPadding,
  },
  getItemLayout,
  ItemSeparatorComponent: showDividers ? Divider : null,
  keyExtractor,
  removeClippedSubviews: true,
}))`
  flex: 1;
  min-height: 1;
`;

const Divider = styled(ListItemDivider).attrs({
  backgroundColor: colors.modalBackground,
})``;

export default function NavigationList({
  isReadOnlyWallet,
  scrollEnabled = false,
  showDividers = true,
}) {
  const { goBack, navigate } = useNavigation();
  const { network } = useAccountSettings();
  const { isSavingsOpen, toggleOpenSavings } = useOpenSavings();
  const { isTreasuryBankOpen, toggleOpenTreasuryBank } = useOpenTreasuryBank();
  const { isLPBonusOpen, toggleOpenLPBonus } = useOpenLPBonus();

  const { showPanel: showHolyEarlyLPBonusPanel } = useHolyEarlyLPBonus();
  const { balanceUSDC: savingsBalance } = useHolySavings();
  const { allBalanceUSDC: treasuryBalance } = useHolyTreasury();

  const isSavingsSectionEmpty = useMemo(() => {
    return !greaterThan(savingsBalance, 0);
  }, [savingsBalance]);

  const isTreasurySectionEmpty = useMemo(() => {
    return !greaterThan(treasuryBalance, 0);
  }, [treasuryBalance]);

  const rows = useMemo(
    () => [
      {
        disabled: false,
        height: rowHeight,
        id: 'savingsItem',
        isVisible: network === networkTypes.mainnet,
        name: 'Savings',
        onPress: () => {
          navigate(Routes.WALLET_SCREEN);
          if (!isSavingsOpen) {
            toggleOpenSavings();
          }
          navigate(Routes.SAVINGS_SHEET, {
            longFormHeight: isSavingsSectionEmpty
              ? SavingsSheetEmptyHeight
              : SavingsSheetHeight,
          });
        },
      },
      {
        disabled: false,
        height: rowHeight,
        id: 'treasuryItem',
        // isVisible: network === networkTypes.mainnet,
        isVisible: false,
        name: 'Treasury',
        onPress: () => {
          if (!isReadOnlyWallet) {
            navigate(Routes.WALLET_SCREEN);
            if (!isTreasuryBankOpen) {
              toggleOpenTreasuryBank();
            }
            navigate(Routes.TREASURY_SHEET, {
              longFormHeight: isTreasurySectionEmpty
                ? TreasurySheetEmptyState
                : TreasurySheetHeight,
            });
          } else {
            Alert.alert(`You need to import the wallet in order to do this`);
          }
        },
      },
      {
        disabled: false,
        height: rowHeight,
        id: 'earlyLPBonusItem',
        isVisible: showHolyEarlyLPBonusPanel,
        name: 'Early LP Bonus',
        onPress: () => {
          navigate(Routes.WALLET_SCREEN);
          if (!isLPBonusOpen) {
            toggleOpenLPBonus();
          }
          navigate(Routes.WALLET_SCREEN);
        },
      },
      {
        disabled: false,
        height: rowHeight,
        id: 'poolsItem',
        isVisible: false,
        name: 'Pools',
        onPress: NOOP,
      },
      {
        disabled: isReadOnlyWallet,
        height: rowHeight,
        id: 'swapItem',
        isVisible: get(networkInfo[network], 'exchange_enabled'),
        name: 'Swap',
        onPress: () => {
          if (!isReadOnlyWallet) {
            goBack();
            if (!USE_HOLY_SWAP) {
              navigate(Routes.EXCHANGE_MODAL);
            } else {
              navigate(Routes.HOLY_SWAP_MODAL, {
                params: {
                  screen: Routes.MAIN_EXCHANGE_SCREEN,
                },
                screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
              });
            }
          } else {
            Alert.alert(`You need to import the wallet in order to do this`);
          }
        },
      },
      {
        disabled: isReadOnlyWallet,
        height: rowHeight,
        id: 'sendItem',
        isVisible: true,
        name: 'Send',
        onPress: () => {
          if (!isReadOnlyWallet) {
            goBack();
            navigate(Routes.SEND_FLOW);
          } else {
            Alert.alert(`You need to import the wallet in order to do this`);
          }
        },
      },
    ],
    [
      goBack,
      isLPBonusOpen,
      isReadOnlyWallet,
      isSavingsOpen,
      isSavingsSectionEmpty,
      isTreasuryBankOpen,
      isTreasurySectionEmpty,
      navigate,
      network,
      showHolyEarlyLPBonusPanel,
      toggleOpenLPBonus,
      toggleOpenSavings,
      toggleOpenTreasuryBank,
    ]
  );

  const rowsToRender = useMemo(() => {
    const r = rows.filter(r => !r.disabled && r.isVisible);
    return r.length === 0
      ? [
          {
            disabled: false,
            height: rowHeight,
            id: 'placeholder',
            isVisible: true,
            name: '👻 No items here. Import a non-empty wallet first',
            onPress: () => {
              goBack();
            },
          },
        ]
      : r;
  }, [goBack, rows]);

  const rowsLength = useMemo(() => {
    return rowsToRender.length;
  }, [rowsToRender]);

  const listHeight =
    (rowHeight + (showDividers ? 2 : 0)) * rowsLength + listPaddingBottom;

  const renderItem = ({ item }) => {
    return item.isVisible ? (
      <Column height={item.height}>
        <NavigationRow
          disabled={item.disabled}
          onPress={item.onPress}
          title={item.name}
        />
      </Column>
    ) : null;
  };

  return (
    <Container height={listHeight}>
      <NavigationFlatList
        data={rowsToRender}
        initialNumToRender={rowsLength}
        renderItem={renderItem}
        scrollEnabled={scrollEnabled}
        showDividers={showDividers}
      />
    </Container>
  );
}
