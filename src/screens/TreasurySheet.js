import { useRoute } from '@react-navigation/native';
import React, { Fragment, useCallback } from 'react';
import { Alert, StatusBar } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import Divider from '../components/Divider';
import TreasuryCoinRow from '../components/coin-row/TreasuryCoinRow';
import { Centered, Column } from '../components/layout';
import {
  SheetActionButton,
  SheetActionButtonRow,
  SlackSheet,
} from '../components/sheet';
import TreasurySheetHeader from '../components/treasury-bank/TreasurySheetHeader';
import { useDimensions, useWallets } from '@rainbow-me/hooks';
import { useNavigation } from '@rainbow-me/navigation';
import Routes from '@rainbow-me/routes';
import { colors, position } from '@rainbow-me/styles';

export const SavingsSheetEmptyHeight = 313;
export const SavingsSheetHeight = android ? 410 : 352;

const Container = styled(Centered).attrs({ direction: 'column' })`
  ${position.cover};
  ${({ deviceHeight, height }) =>
    height ? `height: ${height + deviceHeight}` : null};
`;

const TreasurySheet = () => {
  const { height: deviceHeight } = useDimensions();
  const { navigate } = useNavigation();
  const { params } = useRoute();
  const insets = useSafeArea();
  const { isReadOnlyWallet } = useWallets();
  const balance = params['balance'];
  const lifetimeSupplyInterestAccrued = params['lifetimeSupplyInterestAccrued'];
  const isEmpty = balance === 0;
  const onWithdraw = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.TREASURY_CLAIM_MODAL, {
        balance,
      });
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [isReadOnlyWallet, navigate, balance]);

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
        <Fragment>
          <TreasurySheetHeader
            balance={balance}
            lifetimeAccruedInterest={lifetimeSupplyInterestAccrued}
          />
          <SheetActionButtonRow>
            <SheetActionButton
              color={colors.dark}
              label="Claim & Burn"
              onPress={onWithdraw}
              radiusAndroid={24}
              weight="bold"
            />
          </SheetActionButtonRow>
          <Divider color={colors.rowDividerLight} zIndex={0} />
          <Column paddingBottom={9} paddingTop={4}>
            <TreasuryCoinRow
              additionalShare="0.1"
              balance={balance}
              share="1.37x share"
              symbol="USD"
            />
          </Column>
          <Divider color={colors.rowDividerLight} zIndex={0} />
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
      </SlackSheet>
    </Container>
  );
};

export default React.memo(TreasurySheet);
