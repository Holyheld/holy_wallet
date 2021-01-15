import { get } from 'lodash';
import React, { useMemo } from 'react';
import { Alert, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import styled from 'styled-components/primitives';
import networkInfo from '../../helpers/networkInfo';
import useOpenLPBonus from '../../hooks/useOpenLPBonus';
import useOpenTreasuryBank from '../../hooks/useOpenTreasuryBank';
import { Column } from '../layout';
import { ListItemDivider } from '../list';
import NavigationRow from './NavigationRow';
import {
  useAccountSettings,
  useAccountTransactions,
  useOpenSavings,
} from '@rainbow-me/hooks';
import { useNavigation } from '@rainbow-me/navigation';
import Routes from '@rainbow-me/routes';
import { colors } from '@rainbow-me/styles';

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

  // TODO replace with selectors
  const accountTransactions = useAccountTransactions(true, true);
  const { sections } = accountTransactions;

  const isSectionsListEmpty = !sections || sections.length === 0;

  const rows = useMemo(
    () => [
      {
        disabled: false,
        height: rowHeight,
        id: 'savingsItem',
        isVisible: !isSectionsListEmpty,
        name: 'Savings',
        onPress: () => {
          if (!isSavingsOpen) {
            toggleOpenSavings();
          }
          navigate(Routes.WALLET_SCREEN);
        },
      },
      {
        disabled: false,
        height: rowHeight,
        id: 'treasuryItem',
        isVisible: false,
        name: 'Treasury',
        onPress: () => {
          if (!isTreasuryBankOpen) {
            toggleOpenTreasuryBank();
          }
          navigate(Routes.WALLET_SCREEN);
        },
      },
      {
        disabled: false,
        height: rowHeight,
        id: 'earlyLPBonusItem',
        isVisible: !isSectionsListEmpty,
        name: 'Early LP Bonus',
        onPress: () => {
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
        isVisible:
          get(networkInfo[network], 'exchange_enabled') && !isSectionsListEmpty,
        name: 'Swap',
        onPress: () => {
          if (!isReadOnlyWallet) {
            goBack();
            setTimeout(() => {
              navigate(Routes.EXCHANGE_MODAL);
            }, 50);
          } else {
            Alert.alert(`You need to import the wallet in order to do this`);
          }
        },
      },
      {
        disabled: isReadOnlyWallet,
        height: rowHeight,
        id: 'sendItem',
        isVisible: !isSectionsListEmpty,
        name: 'Send',
        onPress: () => {
          if (!isReadOnlyWallet) {
            goBack();
            setTimeout(() => {
              navigate(Routes.SEND_FLOW);
            }, 50);
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
      isSectionsListEmpty,
      isTreasuryBankOpen,
      navigate,
      network,
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
