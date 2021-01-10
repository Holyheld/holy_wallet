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
import { useAccountSettings, useOpenSavings } from '@rainbow-me/hooks';
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
  const { navigate } = useNavigation();
  const { network } = useAccountSettings();
  const { isSavingsOpen, toggleOpenSavings } = useOpenSavings();
  const { isTreasuryBankOpen, toggleOpenTreasuryBank } = useOpenTreasuryBank();
  const { isLPBonusOpen, toggleOpenLPBonus } = useOpenLPBonus();

  const rows = useMemo(
    () => [
      {
        disabled: false,
        height: rowHeight,
        id: 'savingsItem',
        isVisible: true,
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
        isVisible: true,
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
        isVisible: true,
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
        isVisible: true,
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
            navigate(Routes.EXCHANGE_MODAL);
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
            navigate(Routes.SEND_FLOW);
          } else {
            Alert.alert(`You need to import the wallet in order to do this`);
          }
        },
      },
    ],
    [
      isLPBonusOpen,
      isReadOnlyWallet,
      isSavingsOpen,
      isTreasuryBankOpen,
      navigate,
      network,
      toggleOpenLPBonus,
      toggleOpenSavings,
      toggleOpenTreasuryBank,
    ]
  );

  const rowsToRender = useMemo(() => {
    return rows.filter(r => !r.disabled && r.isVisible);
  }, [rows]);

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
