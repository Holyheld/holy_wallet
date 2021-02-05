import BigNumber from 'bignumber.js';
import React, { Fragment, useCallback, useMemo } from 'react';
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
import { greaterThan, multiply } from '../helpers/utilities';
import { useEthPrice } from '../hooks/useGenericAssets';
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
    hhEthPrice,
  } = useHolyEarlyLPBonus();

  const ethNativePrice = useEthPrice();

  const {
    amountToClaimDisplay,
    nativeAmountToclaimDisplay,
    dpyDisplay,
    dpyNativeAmountDisplay,
    dpyAmountDisplay,
    isEmpty,
  } = useMemo(() => {
    const isEmpty = !greaterThan(amountToClaim, '0');
    const amountToClaimDisplay = new BigNumber(amountToClaim).toFormat(2);
    let nativeAmountToclaimDisplay = '0';
    if (greaterThan(nativeAmountToclaim, '0')) {
      nativeAmountToclaimDisplay = new BigNumber(nativeAmountToclaim).toFormat(
        2
      );
    } else {
      nativeAmountToclaimDisplay = multiply(
        amountToClaim,
        multiply(hhEthPrice, ethNativePrice)
      );
      nativeAmountToclaimDisplay = new BigNumber(
        nativeAmountToclaimDisplay
      ).toFormat(2);
    }

    const dpyDisplay = new BigNumber(dpy).toFormat(2);

    let dpyNativeAmountDisplay = '0';
    if (greaterThan(dpyNativeAmount, '0')) {
      dpyNativeAmountDisplay = new BigNumber(dpyNativeAmount).toFormat(2);
    } else {
      dpyNativeAmountDisplay = multiply(
        dpyAmount,
        multiply(hhEthPrice, ethNativePrice)
      );
      dpyNativeAmountDisplay = new BigNumber(dpyNativeAmountDisplay).toFormat(
        2
      );
    }

    const dpyAmountDisplay = new BigNumber(dpyAmount)
      .decimalPlaces(2)
      .toString();

    return {
      amountToClaimDisplay,
      dpyAmountDisplay,
      dpyDisplay,
      dpyNativeAmountDisplay,
      isEmpty,
      nativeAmountToclaimDisplay,
    };
  }, [
    amountToClaim,
    dpy,
    dpyAmount,
    dpyNativeAmount,
    ethNativePrice,
    hhEthPrice,
    nativeAmountToclaim,
  ]);

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
            nativeBalance={nativeAmountToclaimDisplay}
            nativeDPYBalance={dpyNativeAmountDisplay}
          />
          <SheetActionButtonRow>
            <SheetActionButton
              alignSelf="center"
              color={colors.buttonClaimAndBurn}
              label="Claim"
              onPress={onClaim}
              radiusAndroid={24}
              textColor={colors.textColorClaimAndBurn}
              weight="bold"
              width={160}
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
              balance={amountToClaimDisplay}
              dpy={dpyDisplay}
              dpyAmount={dpyAmountDisplay}
              symbol={HHAsset.symbol}
            />
          </Column>
          <Divider
            backgroundColor={colors.modalBackground}
            color={colors.divider}
            zIndex={0}
          />
          <LPBonusPredictionStepper dpyNativeAmount={dpyNativeAmountDisplay} />
        </Fragment>
      </SlackSheet>
    </Container>
  );
};

export default React.memo(LPBonusSheet);
