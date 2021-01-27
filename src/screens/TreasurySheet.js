import BigNumber from 'bignumber.js';
import { divide } from 'lodash';
import React, { Fragment, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import Divider from '../components/Divider';
import ButtonPressAnimation from '../components/animations/ButtonPressAnimation/ButtonPressAnimation.android';
import TreasuryCoinRow from '../components/coin-row/TreasuryCoinRow';
import { Centered, Column, RowWithMargins } from '../components/layout';
import { SheetTitle, SlackSheet } from '../components/sheet';
import { DollarFigure, Text } from '../components/text';
import TreasuryPredictionStepper from '../components/treasury-bank/TreasuryPredictionStepper';
import TreasurySheetEmptyState from '../components/treasury-bank/TreasurySheetEmptyState';
import { greaterThan, multiply } from '../helpers/utilities';
import { useHolyTreasury } from '../hooks/useHolyData';
import { getUSDCAsset } from '../references/holy';
import {
  useAccountSettings,
  useDimensions,
  useWallets,
} from '@holyheld-com/hooks';
//import { useNavigation } from '@holyheld-com/navigation';
//import Routes from '@holyheld-com/routes';
import { colors, padding, position } from '@holyheld-com/styles';

export const SavingsSheetEmptyHeight = 313;
export const SavingsSheetHeight = android ? 410 : 352;
let headerHeight = android ? 0 : 30;

const Container = styled(Centered).attrs({ direction: 'column' })`
  ${position.cover};
  ${({ deviceHeight, height }) =>
    height ? `height: ${height + deviceHeight}` : null};
`;

const Whitespace = styled.View`
  background-color: ${colors.modalBackground};
  bottom: -400px;
  height: 400px;
  position: absolute;
  width: 100%;
`;

const ManageButton = styled(ButtonPressAnimation).attrs(({ editMode }) => ({
  radiusAndroid: 24,
  scaleTo: 0.96,
  wrapperStyle: {
    alignSelf: 'flex-end',
    height: 40,
    marginRight: 7,
    width: editMode ? 120 : 108,
  },
}))`
  padding: 12px;
  ${ios
    ? `
  position: absolute;
  right: 7px;
  top: 6px;
  `
    : `
    position: relative;
    right: 0px;
    top: -10px;
    z-index: 99999;
  `}
`;

const ManageButtonLabel = styled(Text).attrs(({ editMode }) => ({
  align: 'right',
  color: colors.textColor,
  letterSpacing: 'roundedMedium',
  size: 'large',
  weight: editMode ? 'semibold' : 'medium',
}))``;

const TreasurySheet = () => {
  const { height: deviceHeight } = useDimensions();
  //const { navigate } = useNavigation();
  const insets = useSafeArea();
  const { isReadOnlyWallet } = useWallets();
  const { network } = useAccountSettings();

  const [editMode, setEditMode] = useState(false);

  const treasury = useHolyTreasury();

  const {
    allBalanceNativeDisplay,
    allBalanceUSDCDisplay,
    bonusBalanceNativeDisplay,
    bonusBalanceUSDCDisplay,
    // hhDispaly,
    // hhEthLPDisplay,
    isEmpty,
  } = useMemo(() => {
    const isEmpty = !greaterThan(new BigNumber(treasury.allBalanceNative), '0');
    const allBalanceNativeDisplay = new BigNumber(
      treasury.allBalanceNative
    ).toFormat(2);
    const bonusBalanceNativeDisplay = new BigNumber(
      treasury.bonusBalanceNative
    ).toFormat(2);

    const allBalanceUSDCDisplay = new BigNumber(
      treasury.allBalanceUSDC
    ).toFormat(6);
    const bonusBalanceUSDCDisplay = new BigNumber(
      treasury.bonusBalanceUSDC
    ).toFormat(6);

    const hhDispaly = new BigNumber(treasury.hh).toFormat(6);

    const hhEthLPDisplay = new BigNumber(treasury.hhEthLP).toFormat(6);
    return {
      allBalanceNativeDisplay,
      allBalanceUSDCDisplay,
      bonusBalanceNativeDisplay,
      bonusBalanceUSDCDisplay,
      hhDispaly,
      hhEthLPDisplay,
      isEmpty,
    };
  }, [treasury]);

  const { dpyNative } = useMemo(() => {
    const dpyNative = divide(
      multiply(treasury.allBalanceNativeDisplay, divide(treasury.apy, '100')),
      '365'
    );
    return {
      dpyNative,
    };
  }, [treasury]);

  const usdcAsset = getUSDCAsset(network);

  // const onClaim = useCallback(() => {
  //   if (!isReadOnlyWallet) {
  //     navigate(Routes.TREASURY_CLAIM_MODAL);
  //   } else {
  //     Alert.alert(`You need to import the wallet in order to do this`);
  //   }
  // }, [isReadOnlyWallet, navigate]);

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
          <TreasurySheetEmptyState isReadOnlyWallet={isReadOnlyWallet} />
        ) : (
          <Fragment>
            {android && <Whitespace />}
            <Column height={headerHeight} justify="space-between">
              <SheetTitle>TREASURY</SheetTitle>
            </Column>

            <ManageButton
              editMode={editMode}
              onPress={() => setEditMode(!editMode)}
            >
              <ManageButtonLabel editMode={editMode}>
                {editMode ? 'Done' : 'Manage'}
              </ManageButtonLabel>
            </ManageButton>
            <Centered css={padding(0, 0, 8)} direction="column">
              {!editMode && (
                <>
                  <DollarFigure decimals={2} value={allBalanceNativeDisplay} />
                  <RowWithMargins align="center" margin={4} marginTop={1}>
                    <Text
                      align="center"
                      color={colors.green}
                      letterSpacing="roundedTight"
                      lineHeight="loose"
                      size="large"
                      weight="semibold"
                    >
                      ${bonusBalanceNativeDisplay}
                    </Text>
                  </RowWithMargins>
                </>
              )}
            </Centered>

            <Divider
              backgroundColor={colors.modalBackground}
              color={colors.divider}
              zIndex={0}
            />
            <Column paddingBottom={9} paddingTop={4}>
              <TreasuryCoinRow
                additionalShare={bonusBalanceUSDCDisplay}
                balance={allBalanceUSDCDisplay}
                share={treasury.apy}
                symbol={usdcAsset.symbol}
              />
            </Column>
            <Divider
              backgroundColor={colors.modalBackground}
              color={colors.divider}
              zIndex={0}
            />
            <TreasuryPredictionStepper dpyNativeAmount={dpyNative} />
          </Fragment>
        )}
      </SlackSheet>
    </Container>
  );
};

export default React.memo(TreasurySheet);
