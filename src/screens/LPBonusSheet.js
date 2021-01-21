import React, { Fragment, useCallback } from 'react';
import { Alert, StatusBar } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import Divider from '../components/Divider';
import LPBonusCoinRow from '../components/coin-row/LPBonusCoinRow';
import { Centered, Column } from '../components/layout';
import LPBonusPredictionStepper from '../components/lp-bonus/LPBonusPredictionStepper';
import LPBonusSheetHeader from '../components/lp-bonus/LPBonusSheetHeader';
import {
  SheetActionButton,
  SheetActionButtonRow,
  SlackSheet,
} from '../components/sheet';
import { greaterThan } from '../helpers/utilities';
import { useHolyEarlyLPBonus } from '../hooks/useHolyData';
import { getHHAsset } from '../references/holy';
import {
  useAccountSettings,
  useDimensions,
  useWallets,
} from '@holyheld-com/hooks';
import { useNavigation } from '@holyheld-com/navigation';
import Routes from '@holyheld-com/routes';
import { colors, position } from '@holyheld-com/styles';

export const SheetEmptyHeight = 313;
export const SheetHeight = android ? 410 : 362;

const Container = styled(Centered).attrs({ direction: 'column' })`
  ${position.cover};
  ${({ deviceHeight, height }) =>
    height ? `height: ${height + deviceHeight}` : null};
`;

const LPBonusSheet = () => {
  const { height: deviceHeight } = useDimensions();
  const { navigate } = useNavigation();
  const insets = useSafeArea();
  const { isReadOnlyWallet } = useWallets();
  const { network } = useAccountSettings();
  const HHAsset = getHHAsset(network);

  const {
    amountToClaim,
    dpy,
    nativeAmountToclaim,
    dpyNativeAmount,
    dpyAmount,
  } = useHolyEarlyLPBonus();

  const isEmpty = !greaterThan(amountToClaim, '0');
  const onClaim = useCallback(() => {
    if (!isReadOnlyWallet) {
      // TODO: Claim LP bonus
      navigate(Routes.HOLY_CLAIM_LP_BONUS, {
        bonusToClaimBalance: amountToClaim,
      });
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [isReadOnlyWallet, navigate, amountToClaim]);

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
          <LPBonusSheetHeader
            nativeBalance={nativeAmountToclaim}
            nativeDPYBalance={dpyNativeAmount}
          />
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
            <LPBonusCoinRow
              address={HHAsset.address}
              balance={amountToClaim}
              dpy={dpy}
              dpyAmount={dpyAmount}
              symbol={HHAsset.symbol}
            />
          </Column>
          <Divider
            backgroundColor={colors.modalBackground}
            color={colors.divider}
            zIndex={0}
          />
          <LPBonusPredictionStepper dpyNativeAmount={dpyNativeAmount} />
        </Fragment>
      </SlackSheet>
    </Container>
  );
};

export default React.memo(LPBonusSheet);
