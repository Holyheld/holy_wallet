import { useRoute } from '@react-navigation/native';
import React, { Fragment, useCallback } from 'react';
import { Alert, StatusBar } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import Divider from '../components/Divider';
import LPBonusCoinRow from '../components/coin-row/LPBonusCoinRow';
import { Centered, Column } from '../components/layout';
import LPBonusSheetHeader from '../components/lp-bonus/LPBonusSheetHeader';
import {
  SheetActionButton,
  SheetActionButtonRow,
  SlackSheet,
} from '../components/sheet';
import { useHolyBonusRate } from '../hooks/useHolySavings';
import { useDimensions, useWallets } from '@rainbow-me/hooks';
import { useNavigation } from '@rainbow-me/navigation';
import Routes from '@rainbow-me/routes';
import { colors, position } from '@rainbow-me/styles';

export const SheetEmptyHeight = 313;
export const SheetHeight = android ? 360 : 312;

const Container = styled(Centered).attrs({ direction: 'column' })`
  ${position.cover};
  ${({ deviceHeight, height }) =>
    height ? `height: ${height + deviceHeight}` : null};
`;

const LPBonusSheet = () => {
  const { height: deviceHeight } = useDimensions();
  const { navigate } = useNavigation();
  const { params } = useRoute();
  const insets = useSafeArea();
  const { isReadOnlyWallet } = useWallets();
  const { bonusRate } = useHolyBonusRate();
  const balance = params['balance'];
  const isEmpty = balance === 0;
  const onClaim = useCallback(() => {
    if (!isReadOnlyWallet) {
      // TODO: Claim LP bonus
      navigate(Routes.HOLY_CLAIM_LP_BONUS, {
        bonusToClaimBalance: balance,
      });
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [isReadOnlyWallet, navigate, balance]);

  return (
    <Container
      deviceHeight={deviceHeight}
      height={isEmpty ? SheetEmptyHeight : SheetHeight}
      insets={insets}
    >
      <StatusBar barStyle="light-content" />
      <SlackSheet
        additionalTopPadding={android}
        contentHeight={isEmpty ? SheetEmptyHeight : SheetHeight}
      >
        <Fragment>
          <LPBonusSheetHeader balance={balance} lifetimeAccruedInterest={0} />
          <SheetActionButtonRow>
            <SheetActionButton
              color={colors.buttonClaimAndBurn}
              label="Claim"
              onPress={onClaim}
              radiusAndroid={24}
              textColor={colors.textColorClaimAndBurn}
              weight="bold"
              width="auto"
            />
          </SheetActionButtonRow>
          <Divider
            backgroundColor={colors.modalBackground}
            color={colors.divider}
            zIndex={0}
          />
          <Column paddingBottom={9} paddingTop={4}>
            <LPBonusCoinRow balance={balance} share={bonusRate} symbol="HH" />
          </Column>
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
      </SlackSheet>
    </Container>
  );
};

export default React.memo(LPBonusSheet);
