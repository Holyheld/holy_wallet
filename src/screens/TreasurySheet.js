import BigNumber from 'bignumber.js';
import { divide } from 'lodash';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { Alert, StatusBar } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import Divider from '../components/Divider';
import ButtonPressAnimation from '../components/animations/ButtonPressAnimation/ButtonPressAnimation.android';
import WalletOption from '../components/change-wallet/WalletOption';
import TreasuryCoinRow from '../components/coin-row/TreasuryCoinRow';
import TreasuryCoinRowSecondary from '../components/coin-row/TreasuryCoinRowSecondary';
import { Centered, Column, RowWithMargins } from '../components/layout';
import { SheetTitle, SlackSheet } from '../components/sheet';
import { DollarFigure, Text } from '../components/text';
import TreasuryIcon from '../components/treasury-bank/TreasuryIcon';
import TreasuryPredictionStepper from '../components/treasury-bank/TreasuryPredictionStepper';
import TreasurySheetEmptyState from '../components/treasury-bank/TreasurySheetEmptyState';
import { greaterThan, multiply } from '../helpers/utilities';
import { useHolyTreasury } from '../hooks/useHolyData';
import {
  getHHAsset,
  getHHWethPoolAsset,
  getUSDCAsset,
  getWethAsset,
} from '../references/holy';
import {
  useAccountSettings,
  useDimensions,
  useWallets,
} from '@holyheld-com/hooks';
import { useNavigation } from '@holyheld-com/navigation';
import Routes from '@holyheld-com/routes';
import { colors, padding, position } from '@holyheld-com/styles';
import { showActionSheetWithOptions } from '@holyheld-com/utils';

export const TreasurySheetEmptyHeight = 313;
export const TreasurySheetEditModeHeight = 340;
export const TreasurySheetHeight = android ? 320 : 262;
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

const WalletListFooter = styled(Column)`
  padding-bottom: 6;
  padding-top: 0;
`;

const ManageButtonLabel = styled(Text).attrs(({ editMode }) => ({
  align: 'right',
  color: colors.textColorPrimary,
  letterSpacing: 'roundedMedium',
  size: 'large',
  weight: editMode ? 'semibold' : 'medium',
}))``;

const TreasurySheet = () => {
  const { height: deviceHeight } = useDimensions();
  const { navigate } = useNavigation();
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
    hhDisplay,
    hhEthLPDisplay,
    isEmpty,
  } = useMemo(() => {
    const isEmpty = !greaterThan(new BigNumber(treasury.allBalanceUSDC), '0');
    const allBalanceNativeDisplay = new BigNumber(
      treasury.allBalanceUSDC
    ).toFormat(2);
    const bonusBalanceNativeDisplay = new BigNumber(
      treasury.bonusBalanceUSDC
    ).toFormat(2);

    const allBalanceUSDCDisplay = new BigNumber(
      treasury.allBalanceUSDC
    ).toFormat(2);
    const bonusBalanceUSDCDisplay = new BigNumber(
      treasury.bonusBalanceUSDC
    ).toFormat(2);

    const hhDisplay = new BigNumber(treasury.hh).toFormat(2);

    const hhEthLPDisplay = new BigNumber(treasury.hhEthLP).toFormat(2);
    return {
      allBalanceNativeDisplay,
      allBalanceUSDCDisplay,
      bonusBalanceNativeDisplay,
      bonusBalanceUSDCDisplay,
      hhDisplay,
      hhEthLPDisplay,
      isEmpty,
    };
  }, [treasury]);

  const { dpyNative } = useMemo(() => {
    const dpyNative = divide(
      multiply(treasury.allBalanceUSDC, divide(treasury.apy, '100')),
      '365'
    );
    return {
      dpyNative,
    };
  }, [treasury]);

  const usdcAsset = getUSDCAsset(network);
  const hhAsset = getHHAsset(network);
  const wethAsset = getWethAsset(network);
  const hhWethPoolAsset = getHHWethPoolAsset(network);
  const { nativeCurrencySymbol } = useAccountSettings();

  const onClaim = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.TREASURY_BURN_MODAL, {
        params: {
          screen: Routes.MAIN_EXCHANGE_SCREEN,
        },
        screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
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

  const contentHeight = useMemo(() => {
    if (isEmpty) {
      return TreasurySheetEmptyState;
    }

    return editMode ? TreasurySheetEditModeHeight : TreasurySheetHeight;
  }, [isEmpty, editMode]);

  const onOptionsPressBonus = useCallback(() => {
    showActionSheetWithOptions(
      {
        cancelButtonIndex: 1,
        message: `What?`,
        options: ['Claim & Burn', 'Cancel'],
      },
      async buttonIndex => {
        switch (buttonIndex) {
          case 0:
            onClaim();
            break;
          default:
            return;
        }
      }
    );
  }, [onClaim]);

  const onOptionsPress = useCallback(() => {
    showActionSheetWithOptions(
      {
        cancelButtonIndex: 2,
        message: `What?`,
        options: ['Withdraw', 'Deposit', 'Cancel'],
      },
      async buttonIndex => {
        switch (buttonIndex) {
          case 0:
            navigate(Routes.HOLY_SAVINGS_WITHDRAW_MODAL);
            break;
          case 1:
            navigate(Routes.HOLY_SAVINGS_WITHDRAW_MODAL);
            break;
          default:
            return;
        }
      }
    );
  }, [navigate]);

  return (
    <Container
      deviceHeight={deviceHeight}
      height={contentHeight}
      insets={insets}
    >
      <StatusBar barStyle="light-content" />
      <SlackSheet additionalTopPadding={android} contentHeight={contentHeight}>
        {isEmpty ? (
          <TreasurySheetEmptyState isReadOnlyWallet={isReadOnlyWallet} />
        ) : (
          <Fragment>
            {android && <Whitespace />}
            <Column height={headerHeight} justify="space-between">
              <SheetTitle color={colors.textColorMuted}>
                SMART TREASURY
              </SheetTitle>
            </Column>

            <ManageButton
              editMode={editMode}
              onPress={() => setEditMode(!editMode)}
            >
              <ManageButtonLabel editMode={editMode}>
                {editMode ? 'Done' : 'Manage'}
              </ManageButtonLabel>
            </ManageButton>
            {!editMode ? (
              <>
                <Centered css={padding(0, 0, 8)} direction="column">
                  <DollarFigure
                    currencySymbol={nativeCurrencySymbol}
                    decimals={2}
                    value={allBalanceNativeDisplay}
                  />
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
              </>
            ) : (
              <>
                <Column>
                  <TreasuryCoinRowSecondary
                    address={usdcAsset.address}
                    coinIconRenderer={() => (
                      <RowWithMargins marginLeft={0} width={40}>
                        <TreasuryIcon size={35} />
                      </RowWithMargins>
                    )}
                    editMode
                    name="Treasury Bonus"
                    onOptionsPress={onOptionsPressBonus}
                    symbol={usdcAsset.symbol}
                    value={allBalanceNativeDisplay}
                  />
                </Column>
                <Column>
                  <TreasuryCoinRowSecondary
                    address={hhWethPoolAsset.address}
                    editMode
                    name={hhWethPoolAsset.name}
                    onOptionsPress={onOptionsPress}
                    symbol={hhWethPoolAsset.symbol}
                    tokens={[hhAsset, wethAsset]}
                    value={hhEthLPDisplay}
                  />
                </Column>
                <Column>
                  <TreasuryCoinRowSecondary
                    address={hhAsset.address}
                    editMode
                    name={hhAsset.name}
                    onOptionsPress={onOptionsPress}
                    symbol={hhAsset.symbol}
                    value={hhDisplay}
                  />
                </Column>
                <WalletListFooter>
                  <WalletOption
                    icon="arrowBack"
                    label="Increase treasury boost"
                    onPress={onDeposit}
                  />
                  <WalletOption
                    icon="arrowBack"
                    label="Claim & burn"
                    onPress={onClaim}
                  />
                </WalletListFooter>
              </>
            )}
          </Fragment>
        )}
      </SlackSheet>
    </Container>
  );
};

export default React.memo(TreasurySheet);
