import { useRoute } from '@react-navigation/native';
import analytics from '@segment/analytics-react-native';
import React, { Fragment, useCallback } from 'react';
import { Alert, StatusBar } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import Divider from '../components/Divider';
import HolySavingsCoinRow from '../components/coin-row/HolySavingsCoinRow';

import { Centered, Column } from '../components/layout';
import {
  SavingsSheetEmptyState,
  SavingsSheetHeader,
} from '../components/savings';
import {
  SheetActionButton,
  SheetActionButtonRow,
  SlackSheet,
} from '../components/sheet';
import { useNavigation } from '../navigation/Navigation';
import { useDimensions, useWallets } from '@holyheld-com/hooks';
import Routes from '@holyheld-com/routes';
import { colors, position } from '@holyheld-com/styles';

export const SavingsSheetEmptyHeight = 313;
export const SavingsSheetHeight = android ? 410 : 352;

const Container = styled(Centered).attrs({ direction: 'column' })`
  ${position.cover};
  ${({ deviceHeight, height }) =>
    height ? `height: ${height + deviceHeight}` : null};
`;

const HolySavingsSheet = () => {
  const { height: deviceHeight } = useDimensions();
  const { navigate } = useNavigation();
  const { params } = useRoute();
  const insets = useSafeArea();
  const { isReadOnlyWallet } = useWallets();
  //const { nativeCurrency, nativeCurrencySymbol } = useAccountSettings();
  const totalBalance = params['totalBalance'];
  const isEmpty = totalBalance === '0';
  const lifetimeAccruedInterest = params['lifetimeAccruedInterest'];

  const savingsDataArr = params['savings'];
  const defaultSaving = params['currentSaving'];

  const onWithdraw = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.HOLY_SAVINGS_WITHDRAW_MODAL, {
        params: {
          params: {
            savingBalance: totalBalance,
          },
          screen: Routes.MAIN_EXCHANGE_SCREEN,
        },
        screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
      });

      analytics.track('Navigated to HolySavingsWithdrawModal', {
        category: 'holy savings',
        label: 'HOLY WITHDRAW',
      });
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [isReadOnlyWallet, navigate, totalBalance]);

  const onDeposit = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.HOLY_SAVINGS_DEPOSIT_MODAL, {
        params: {
          params: {
            currentSaving: defaultSaving,
            defaultInputCurrency: null,
          },
          screen: Routes.MAIN_EXCHANGE_SCREEN,
        },
        screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
      });

      analytics.track('Navigated to SavingsDepositModal', {
        category: 'savings',
        empty: isEmpty,
        label: defaultSaving.underlying.symbol,
      });
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [isEmpty, isReadOnlyWallet, navigate, defaultSaving]);

  return (
    <Container
      deviceHeight={deviceHeight}
      height={isEmpty ? SavingsSheetEmptyHeight : SavingsSheetHeight}
      insets={insets}
    >
      <StatusBar barStyle="light-content" />
      <SlackSheet
        additionalTopPadding={android}
        contentHeight={isEmpty ? SavingsSheetEmptyHeight : SavingsSheetHeight}
      >
        {isEmpty ? (
          <SavingsSheetEmptyState
            apy={defaultSaving.apy}
            isReadOnlyWallet={isReadOnlyWallet}
            savings={savingsDataArr}
          />
        ) : (
          <Fragment>
            <SavingsSheetHeader
              balance={totalBalance}
              lifetimeAccruedInterest={lifetimeAccruedInterest}
            />
            <SheetActionButtonRow>
              <SheetActionButton
                color={colors.buttonSecondary}
                label="􀁏 Withdraw"
                onPress={onWithdraw}
                radiusAndroid={24}
                textColor={colors.textColorSecondaryButton}
                weight="bold"
              />
              <SheetActionButton
                color={colors.buttonClaimAndBurn}
                label="􀁍 Deposit"
                onPress={onDeposit}
                radiusAndroid={24}
                textColor={colors.textColorClaimAndBurn}
                weight="bold"
              />
            </SheetActionButtonRow>
            <Divider
              backgroundColor={colors.modalBackground}
              color={colors.divider}
              zIndex={0}
            />

            {savingsDataArr.map(savingsItem => (
              <Column
                key={savingsItem.underlying.address}
                paddingBottom={2}
                paddingTop={1}
              >
                <HolySavingsCoinRow
                  additionalShare="0.111"
                  apy={savingsItem.apy}
                  balance={savingsItem.balance}
                  symbol={savingsItem.underlying.symbol}
                />
              </Column>
            ))}

            <Divider
              backgroundColor={colors.modalBackground}
              color={colors.divider}
              zIndex={0}
            />
            {/* <SavingsPredictionStepper
              asset={underlying}
              balance={
                isSymbolStablecoin(underlying.symbol)
                  ? underlyingBalanceNativeValue
                  : supplyBalanceUnderlying
              }
              interestRate={supplyRate}
            /> */}
          </Fragment>
        )}
      </SlackSheet>
    </Container>
  );
};

export default React.memo(HolySavingsSheet);
