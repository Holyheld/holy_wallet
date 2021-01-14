import { useRoute } from '@react-navigation/native';
import { get } from 'lodash';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { Extrapolate } from 'react-native-reanimated';
import { useAndroidBackHandler } from 'react-navigation-backhandler';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/primitives';
//import ActivityIndicator from '../components/ActivityIndicator';
import { interpolate } from '../components/animations';
import { CoinIcon } from '../components/coin-icon';
import {
  ConfirmExchangeButton,
  ExchangeModalHeader,
  ExchangeNativeField,
} from '../components/exchange';
import ExchangeInput from '../components/exchange/ExchangeInput';
import { FloatingPanel, FloatingPanels } from '../components/floating-panels';
import { GasSpeedButton } from '../components/gas';
import {
  Centered,
  ColumnWithMargins,
  KeyboardFixedOpenLayout,
  Row,
  RowWithMargins,
} from '../components/layout';
import LPBonusInfo from '../components/lp-bonus/LPBonusInfo';
import exchangeModalTypes from '../helpers/exchangeModalTypes';
import { convertAmountToNativeAmount } from '../helpers/utilities';
import { loadWallet } from '../model/wallet';
import { useNavigation } from '../navigation/Navigation';
import useStatusBarManaging from '../navigation/useStatusBarManaging';
import { executeRap } from '../raps/common';
import createHolyClaimCompoundRap, {
  estimateHolyClaimCompound,
} from '../raps/holyClaimCompound';
import { multicallClearState } from '../redux/multicall';
import { HH_V2_ADDRESS } from '../references/holy';
import {
  useAccountSettings,
  useAsset,
  useBlockPolling,
  useGas,
} from '@rainbow-me/hooks';
import Routes from '@rainbow-me/routes';
import { colors, position } from '@rainbow-me/styles';
import { backgroundTask } from '@rainbow-me/utils';

import logger from 'logger';

const BottomRowHeight = android ? 52 : 32;

const AnimatedFloatingPanels = Animated.createAnimatedComponent(FloatingPanels);
const Wrapper = ios ? KeyboardFixedOpenLayout : Fragment;
const CoinSize = 40;
const ExchangeFieldPadding = android ? 15 : 19;
const ExchangeFieldHeight = android ? 64 : 38;

const Container = styled(ColumnWithMargins).attrs({ margin: 15 })`
  padding-top: 6;
  width: 100%;
  z-index: 1;
`;

const InnerContainer = styled(Row).attrs({
  align: 'center',
  justify: 'flex-end',
})`
  width: 100%;
  padding-right: ${ExchangeFieldPadding};
`;

const NativeFieldRow = styled(Row).attrs({
  align: 'center',
  justify: 'space-between',
})`
  height: ${BottomRowHeight};
  padding-left: 19;
`;

const FieldRow = styled(RowWithMargins).attrs({
  align: 'center',
  margin: 30,
})`
  flex: 1;
  padding-left: ${ExchangeFieldPadding};
  padding-right: ${ExchangeFieldPadding};
`;

const Input = styled(ExchangeInput).attrs({
  letterSpacing: 'roundedTightest',
})`
  margin-vertical: -10;
  height: ${ExchangeFieldHeight + (android ? 20 : 0)};
`;

const HolyClaimModalWrapper = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  android && useStatusBarManaging();
  const { params } = useRoute();
  const bonusToClaimBalance = params?.bonusToClaimBalance;
  const testID = params?.testID;

  return (
    <HolyClaimModal bonusToClaimBalance={bonusToClaimBalance} testID={testID} />
  );
};

const HolyClaimModal = ({ bonusToClaimBalance, testID }) => {
  const { navigate, setParams } = useNavigation();
  const {
    params: { tabTransitionPosition },
  } = useRoute();
  const { network } = useAccountSettings();

  const [isLoading, setIsLoading] = useState(true);
  const { nativeCurrency } = useAccountSettings();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const amountToClaim = bonusToClaimBalance;

  const hhCoinV2 = useMemo(() => {
    return {
      address: HH_V2_ADDRESS(network), // from testnet
      symbol: 'HH',
      type: 'token',
    };
  }, [network]);

  const hhV2Asset = useAsset(hhCoinV2);

  const symbol = get(hhV2Asset, 'symbol');
  const address = get(hhV2Asset, 'address');

  const newNativePrice = get(hhV2Asset, 'native.price.amount', '0');
  const nativeAmount = convertAmountToNativeAmount(
    amountToClaim,
    newNativePrice
  );

  const defaultGasLimit = 160000;
  const type = exchangeModalTypes.lpBonusClaim;

  const dispatch = useDispatch();
  const {
    isSufficientGas,
    selectedGasPrice,
    startPollingGasPrices,
    stopPollingGasPrices,
    updateDefaultGasLimit,
    updateTxFee,
  } = useGas();
  const { initWeb3Listener, stopWeb3Listener } = useBlockPolling();

  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [slippage] = useState(null);

  useAndroidBackHandler(() => {
    navigate(Routes.WALLET_SCREEN);
    return true;
  });

  const updateGasLimit = useCallback(async () => {
    try {
      const gasLimit = await estimateHolyClaimCompound(amountToClaim, hhCoinV2);
      logger.sentry('new gas limit:', gasLimit);
      updateTxFee(gasLimit);
    } catch (error) {
      logger.sentry('gas limit error:', error);
      updateTxFee(defaultGasLimit);
    }
  }, [defaultGasLimit, updateTxFee, amountToClaim, hhCoinV2]);

  // Update gas limit
  useEffect(() => {
    updateGasLimit();
  }, [updateGasLimit]);

  useEffect(() => {
    return () => {
      dispatch(multicallClearState());
    };
  }, [dispatch]);

  // // Set default gas limit
  // useEffect(() => {
  //   setTimeout(() => {
  //     updateTxFee(defaultGasLimit);
  //   }, 1000);
  // }, [defaultGasLimit, updateTxFee]);

  // Liten to gas prices, Uniswap reserves updates
  useEffect(() => {
    updateDefaultGasLimit(defaultGasLimit);
    startPollingGasPrices();
    initWeb3Listener();
    return () => {
      stopPollingGasPrices();
      stopWeb3Listener();
    };
  }, [
    defaultGasLimit,
    initWeb3Listener,
    startPollingGasPrices,
    stopPollingGasPrices,
    stopWeb3Listener,
    updateDefaultGasLimit,
  ]);

  const handleSubmit = useCallback(() => {
    backgroundTask.execute(async () => {
      setIsAuthorizing(true);
      try {
        const wallet = await loadWallet();
        if (!wallet) {
          setIsAuthorizing(false);
          logger.sentry(`aborting holy lp bonus claim due to missing wallet`);
          return;
        }

        setIsAuthorizing(false);
        const callback = () => {
          setParams({ focused: false });
          navigate(Routes.PROFILE_SCREEN);
        };
        const rap = await createHolyClaimCompoundRap({
          amount: amountToClaim,
          callback,
          currency: hhCoinV2,
          selectedGasPrice,
        });
        logger.log('[holy lp claim] rap', rap);
        await executeRap(wallet, rap);
        logger.log('[holy lp claim] executed rap!');
      } catch (error) {
        setIsAuthorizing(false);
        logger.log('[holy lp claim] error submitting claim lp bonus', error);
        setParams({ focused: false });
        navigate(Routes.WALLET_SCREEN);
      }
    });
  }, [amountToClaim, selectedGasPrice, setParams, navigate, hhCoinV2]);

  return (
    <Wrapper>
      <Centered
        {...(ios
          ? position.sizeAsObject('100%')
          : { style: { height: 500, top: 0 } })}
        backgroundColor={colors.transparent}
        direction="column"
      >
        {isLoading ? (
          <View
            style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}
          >
            <ActivityIndicator color="#FFFFFF" size="large" />
          </View>
        ) : (
          <AnimatedFloatingPanels
            margin={0}
            paddingTop={24}
            style={{
              opacity: android
                ? 1
                : interpolate(tabTransitionPosition, {
                    extrapolate: Extrapolate.CLAMP,
                    inputRange: [0, 0, 1],
                    outputRange: [1, 1, 0],
                  }),
              transform: [
                {
                  scale: android
                    ? 1
                    : interpolate(tabTransitionPosition, {
                        extrapolate: Animated.Extrapolate.CLAMP,
                        inputRange: [0, 0, 1],
                        outputRange: [1, 1, 0.9],
                      }),
                },
                {
                  translateX: android
                    ? 0
                    : interpolate(tabTransitionPosition, {
                        extrapolate: Animated.Extrapolate.CLAMP,
                        inputRange: [0, 0, 1],
                        outputRange: [0, 0, -8],
                      }),
                },
              ],
            }}
          >
            <FloatingPanel
              overflow="visible"
              paddingBottom={26}
              radius={39}
              testID={testID}
            >
              <ExchangeModalHeader
                onPressDetails={() => {}}
                showDetailsButton={false}
                testID={testID + '-header'}
                title="Claim"
              />
              <Container>
                <InnerContainer>
                  <FieldRow>
                    <CoinIcon
                      address={address}
                      size={CoinSize}
                      symbol={symbol}
                    />

                    <Input editable={false} value={amountToClaim} />
                  </FieldRow>
                </InnerContainer>
                <NativeFieldRow>
                  <ExchangeNativeField
                    editable={false}
                    height={BottomRowHeight}
                    nativeAmount={nativeAmount}
                    nativeCurrency={nativeCurrency}
                    testID={testID + '-native'}
                  />
                </NativeFieldRow>
              </Container>
            </FloatingPanel>
            <LPBonusInfo
              amount={amountToClaim}
              asset={hhCoinV2}
              testID="migrate-info-button"
            />

            <Fragment>
              <Centered
                flexShrink={0}
                paddingHorizontal={15}
                paddingTop={24}
                width="100%"
              >
                <ConfirmExchangeButton
                  isAuthorizing={isAuthorizing}
                  isDeposit={false}
                  isSufficientBalance
                  isSufficientGas={isSufficientGas}
                  isSufficientLiquidity
                  onSubmit={handleSubmit}
                  slippage={slippage}
                  testID={testID + '-confirm'}
                  type={type}
                />
              </Centered>
            </Fragment>

            <GasSpeedButton
              dontBlur
              onCustomGasBlur={() => {}}
              testID={testID + '-gas'}
              type={type}
            />
          </AnimatedFloatingPanels>
        )}
      </Centered>
    </Wrapper>
  );
};

export default HolyClaimModalWrapper;
