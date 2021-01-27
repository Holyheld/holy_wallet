import analytics from '@segment/analytics-react-native';
import BigNumber from 'bignumber.js';
import React, { Fragment, useCallback, useMemo } from 'react';
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
import HolySavingsPredictionStepper from '../components/savings/HolySavingsPredictionStepper';
import {
  SheetActionButton,
  SheetActionButtonRow,
  SlackSheet,
} from '../components/sheet';
import { divide, greaterThan, multiply } from '../helpers/utilities';
import { useHolySavings } from '../hooks/useHolyData';
import { useNavigation } from '../navigation/Navigation';
import { getUSDCAsset } from '../references/holy';
import {
  useAccountSettings,
  useDimensions,
  useWallets,
} from '@holyheld-com/hooks';
import Routes from '@holyheld-com/routes';
import { colors, position } from '@holyheld-com/styles';

export const SavingsSheetEmptyHeight = 343;
export const SavingsSheetHeight = android ? 410 : 352;

const Container = styled(Centered).attrs({ direction: 'column' })`
  ${position.cover};
  ${({ deviceHeight, height }) =>
    height ? `height: ${height + deviceHeight}` : null};
`;

const HolySavingsSheet = () => {
  const { height: deviceHeight } = useDimensions();
  const { navigate } = useNavigation();
  const insets = useSafeArea();
  const { isReadOnlyWallet } = useWallets();
  const { network } = useAccountSettings();

  const savings = useHolySavings();

  const { dpyNative } = useMemo(() => {
    const dpyNative = divide(
      multiply(savings.balanceNative, divide(savings.apy, '100')),
      '365'
    );
    return {
      dpyNative,
    };
  }, [savings]);

  const {
    balanceNativeDisplay,
    balanceUSDCDisplay,
    ildBalanceNativeDisplay,
    ildBalanceUSDCDisplay,
    isEmpty,
  } = useMemo(() => {
    const isEmpty = !greaterThan(new BigNumber(savings.balanceNative), '0');
    const balanceNativeDisplay = new BigNumber(savings.balanceNative).toFormat(
      2
    );
    const ildBalanceNativeDisplay = new BigNumber(
      savings.ildBalanceNative
    ).toFormat(2);

    const balanceUSDCDisplay = new BigNumber(savings.balanceUSDC).toFormat(6);
    const ildBalanceUSDCDisplay = new BigNumber(
      savings.ildBalanceUSDC
    ).toFormat(6);
    return {
      balanceNativeDisplay,
      balanceUSDCDisplay,
      ildBalanceNativeDisplay,
      ildBalanceUSDCDisplay,
      isEmpty,
    };
  }, [savings]);

  const usdcAsset = getUSDCAsset(network);

  const onWithdraw = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.HOLY_SAVINGS_WITHDRAW_MODAL, {
        params: {
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
  }, [isReadOnlyWallet, navigate]);

  const onDeposit = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.HOLY_SAVINGS_DEPOSIT_MODAL, {
        params: {
          screen: Routes.MAIN_EXCHANGE_SCREEN,
        },
        screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
      });
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [isReadOnlyWallet, navigate]);

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
            apy={savings.apy}
            isReadOnlyWallet={isReadOnlyWallet}
          />
        ) : (
          <Fragment>
            <SavingsSheetHeader
              balance={balanceNativeDisplay}
              ildBalance={ildBalanceNativeDisplay}
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

            <Column paddingBottom={2} paddingTop={1}>
              <HolySavingsCoinRow
                additionalShare={ildBalanceUSDCDisplay}
                apy={savings.apy}
                balance={balanceUSDCDisplay}
                symbol={usdcAsset.symbol}
              />
            </Column>

            <Divider
              backgroundColor={colors.modalBackground}
              color={colors.divider}
              zIndex={0}
            />
            <HolySavingsPredictionStepper dpyNativeAmount={dpyNative} />
          </Fragment>
        )}
      </SlackSheet>
    </Container>
  );
};

export default React.memo(HolySavingsSheet);
