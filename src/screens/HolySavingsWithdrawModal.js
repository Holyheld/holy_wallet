import { useRoute } from '@react-navigation/native';
import { get } from 'lodash';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Keyboard } from 'react-native';
import Animated, { Extrapolate } from 'react-native-reanimated';
import { useAndroidBackHandler } from 'react-navigation-backhandler';
import { useDispatch } from 'react-redux';
import { dismissingScreenListener } from '../../shim';
import { interpolate } from '../components/animations';
import {
  ConfirmExchangeButton,
  ExchangeInputField,
  ExchangeModalHeader,
} from '../components/exchange';
import { FloatingPanel, FloatingPanels } from '../components/floating-panels';
import { GasSpeedButton } from '../components/gas';
import { Centered, KeyboardFixedOpenLayout } from '../components/layout';
import exchangeModalTypes from '../helpers/exchangeModalTypes';
import useHolyWithdrawInputs from '../hooks/useHolyWithdrawInputs';
import { loadWallet } from '../model/wallet';
import { ExchangeNavigatorFactory } from '../navigation/ExchangeModalNavigator';
import { useNavigation } from '../navigation/Navigation';
import useStatusBarManaging from '../navigation/useStatusBarManaging';
import { executeRap } from '../raps/common';
import createHolySavingsWithdrawCompoundRap, {
  estimateHolySavingsWithdrawCompound,
} from '../raps/holySavingsWithdrawCompound';
import { multicallClearState } from '../redux/multicall';
import { USDC_TOKEN_ADDRESS } from '../references/holy';
import {
  useAccountSettings,
  useAsset,
  useBlockPolling,
  useGas,
  useSwapInputRefs,
} from '@rainbow-me/hooks';
import Routes from '@rainbow-me/routes';
import { colors, position } from '@rainbow-me/styles';
import { backgroundTask } from '@rainbow-me/utils';

import logger from 'logger';

const AnimatedFloatingPanels = Animated.createAnimatedComponent(FloatingPanels);
const Wrapper = ios ? KeyboardFixedOpenLayout : Fragment;

const HolySavingsWithdrawModalWrapper = ({ navigation, ...props }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  android && useStatusBarManaging();
  const { params } = useRoute();

  const testID = params?.testID;
  const savingBalance = params?.savingBalance;
  return (
    <HolySavingsWithdraModal
      navigation={navigation}
      savingBalance={savingBalance}
      testID={testID}
      {...props}
    />
  );
};

const HolySavingsWithdraModal = ({ testID, savingBalance }) => {
  const {
    navigate,
    setParams,
    dangerouslyGetParent,
    addListener,
  } = useNavigation();
  const {
    params: { tabTransitionPosition },
  } = useRoute();
  const { network, nativeCurrency } = useAccountSettings();

  const defaultGasLimit = 10000;

  const type = exchangeModalTypes.holyWithdraw;
  // useAsset - to get data from uniswap about this asset
  const USDc = {
    address: USDC_TOKEN_ADDRESS(network),
    native: {
      price: {
        amount: '1',
      },
    },
    symbol: 'USDC',
  };

  const USDcCurrency = useAsset(USDc);

  // const { uniswapAssetsInWallet } = useUniswapAssetsInWallet();

  logger.log(USDcCurrency);

  // const { curatedAssets } = useUniswapAssets();

  // logger.log(curatedAssets);

  // useUniswapCurrencies({
  //   defaultInputSaving: currentSaving,
  //   inputHeaderTitle: 'choose saving',
  // });

  //console.log(inputCurrency);

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

  useAndroidBackHandler(() => {
    navigate(Routes.WALLET_SCREEN);
    return true;
  });

  const {
    handleFocus,
    inputFieldRef,
    lastFocusedInputHandle,
    nativeFieldRef,
  } = useSwapInputRefs({
    inputCurrency: USDcCurrency,
    outputCurrency: USDcCurrency,
  });

  const {
    inputAmount,
    isMax,
    isSufficientBalance,
    nativeAmount,
    updateInputAmount,
    updateNativeAmount,
  } = useHolyWithdrawInputs({
    inputCurrency: USDcCurrency,
    maxInputBalance: savingBalance,
  });

  const isDismissing = useRef(false);
  useEffect(() => {
    if (ios) {
      return;
    }
    dismissingScreenListener.current = () => {
      Keyboard.dismiss();
      isDismissing.current = true;
    };
    const unsubscribe = (
      dangerouslyGetParent()?.dangerouslyGetParent()?.addListener || addListener
    )('transitionEnd', ({ data: { closing } }) => {
      if (!closing && isDismissing.current) {
        isDismissing.current = false;
        lastFocusedInputHandle?.current?.focus();
      }
    });
    return () => {
      unsubscribe();
      dismissingScreenListener.current = undefined;
    };
  }, [addListener, dangerouslyGetParent, lastFocusedInputHandle]);

  const handleCustomGasBlur = useCallback(() => {
    lastFocusedInputHandle?.current?.focus();
  }, [lastFocusedInputHandle]);

  const updateGasLimit = useCallback(async () => {
    try {
      const gasLimit = await estimateHolySavingsWithdrawCompound({
        inputAmount,
      });

      updateTxFee(gasLimit);
    } catch (error) {
      updateTxFee(defaultGasLimit);
    }
  }, [inputAmount, updateTxFee]);

  // Update gas limit
  useEffect(() => {
    updateGasLimit();
  }, [updateGasLimit]);

  useEffect(() => {
    return () => {
      dispatch(multicallClearState());
    };
  }, [dispatch]);

  // Set default gas limit
  useEffect(() => {
    setTimeout(() => {
      updateTxFee(defaultGasLimit);
    }, 1000);
  }, [defaultGasLimit, updateTxFee]);

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

  const handlePressMaxBalance = useCallback(async () => {
    updateInputAmount(savingBalance);
  }, [updateInputAmount, savingBalance]);

  const handleSubmit = useCallback(() => {
    backgroundTask.execute(async () => {
      setIsAuthorizing(true);
      try {
        const wallet = await loadWallet();
        if (!wallet) {
          setIsAuthorizing(false);
          logger.sentry(`aborting holy savings withdraw due to missing wallet`);
          return;
        }

        const callback = () => {
          setParams({ focused: false });
          navigate(Routes.PROFILE_SCREEN);
        };
        const rap = await createHolySavingsWithdrawCompoundRap({
          callback,
          inputAmount,
          inputCurrency: USDcCurrency,
          isMax,
          selectedGasPrice,
        });
        logger.log('[holy savings withdraw] rap', rap);
        await executeRap(wallet, rap);
        logger.log('[holy savings withdraw] executed rap!');
        setIsAuthorizing(false);
      } catch (error) {
        setIsAuthorizing(false);
        logger.log('[holy savings withdraw] error submitting', error);
        setParams({ focused: false });
        navigate(Routes.WALLET_SCREEN);
      }
    });
  }, [inputAmount, selectedGasPrice, setParams, navigate, isMax]);

  return (
    <Wrapper>
      <Centered
        {...(ios
          ? position.sizeAsObject('100%')
          : { style: { height: 500, top: 0 } })}
        backgroundColor={colors.transparent}
        direction="column"
      >
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
              title="Withdraw"
            />
            <ExchangeInputField
              disableInputCurrencySelection
              inputAmount={inputAmount}
              inputCurrencyAddress={get(USDcCurrency, 'address', null)}
              inputCurrencySymbol={get(USDcCurrency, 'symbol', null)}
              inputFieldRef={inputFieldRef}
              nativeAmount={nativeAmount}
              nativeCurrency={nativeCurrency}
              nativeFieldRef={nativeFieldRef}
              onFocus={handleFocus}
              onPressMaxBalance={handlePressMaxBalance}
              setInputAmount={updateInputAmount}
              setNativeAmount={updateNativeAmount}
              showNative
              testID={testID + '-input'}
            />
          </FloatingPanel>

          <Fragment>
            <Centered
              flexShrink={0}
              paddingHorizontal={15}
              paddingTop={24}
              width="100%"
            >
              <ConfirmExchangeButton
                disabled={!Number(inputAmount)}
                isAuthorizing={isAuthorizing}
                isDeposit={false}
                isSufficientBalance={isSufficientBalance}
                isSufficientGas={isSufficientGas}
                isSufficientLiquidity
                onSubmit={handleSubmit}
                testID={testID + '-confirm'}
                type={type}
              />
            </Centered>
          </Fragment>

          <GasSpeedButton
            dontBlur
            onCustomGasBlur={handleCustomGasBlur}
            testID={testID + '-gas'}
            type={type}
          />
        </AnimatedFloatingPanels>
      </Centered>
    </Wrapper>
  );
};

export default ExchangeNavigatorFactory(HolySavingsWithdrawModalWrapper);
