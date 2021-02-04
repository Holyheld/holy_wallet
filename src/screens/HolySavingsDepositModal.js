import { useRoute } from '@react-navigation/native';
import { get } from 'lodash';
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, Keyboard, View } from 'react-native';

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
import DepositMaxAmountInfo from '../components/savings/DepositMaxAmountInfo';
import DepositSwapInfo from '../components/savings/DepositSwapInfo';
import exchangeModalTypes from '../helpers/exchangeModalTypes';
import useHolyDepositCurrencies from '../hooks/useHolyDepositCurrencies';
import useHolyDepositInputs from '../hooks/useHolyDepositInputs';
import { loadWallet } from '../model/wallet';
import { ExchangeNavigatorFactory } from '../navigation/ExchangeModalNavigator';
import { useNavigation } from '../navigation/Navigation';
import useStatusBarManaging from '../navigation/useStatusBarManaging';
import { executeRap } from '../raps/common';
import createHolySavingsDepositCompoundRap, {
  estimateHolySavingsDepositCompound,
} from '../raps/holySavingsDepositCompound';
import { multicallClearState } from '../redux/multicall';
import store from '../redux/store';
import { getUSDCAsset, USDC_TOKEN_ADDRESS } from '../references/holy';
import {
  useAccountSettings,
  useBlockPolling,
  useGas,
  useMaxInputBalance,
  useSwapInputRefs,
} from '@holyheld-com/hooks';
import { ethUnits } from '@holyheld-com/references';
import Routes from '@holyheld-com/routes';
import { colors, position } from '@holyheld-com/styles';
import { backgroundTask, isNewValueForPath } from '@holyheld-com/utils';

import logger from 'logger';

const AnimatedFloatingPanels = Animated.createAnimatedComponent(FloatingPanels);
const Wrapper = ios ? KeyboardFixedOpenLayout : Fragment;

const HolySavingsDepositModalWrapper = ({ navigation, ...props }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  android && useStatusBarManaging();
  const { params } = useRoute();
  let defaultInputCurrency = params?.defaultInputCurrency;

  //const { allAssets } = useAccountAssets();

  //if (!defaultInputCurrency) {
  //  defaultInputCurrency = ethereumUtils.getAsset(allAssets);
  //}

  const testID = params?.testID;
  return (
    <HolySavingsDepositModal
      defaultInputCurrency={defaultInputCurrency}
      navigation={navigation}
      testID={testID}
      {...props}
    />
  );
};

const HolySavingsDepositModal = ({ defaultInputCurrency, testID }) => {
  const {
    navigate,
    setParams,
    dangerouslyGetParent,
    addListener,
  } = useNavigation();
  const {
    params: { tabTransitionPosition },
  } = useRoute();

  const { nativeCurrency, network } = useAccountSettings();

  const defaultGasLimit = ethUnits.basic_holy_savings_deposit;

  const type = exchangeModalTypes.holyDeposit;

  let USDcAsset = getUSDCAsset(network);

  const genericAssets = store.getState().data.genericAssets;
  const usdcAddress = USDC_TOKEN_ADDRESS(network);
  if (genericAssets[usdcAddress]) {
    USDcAsset.native = {
      price: { amount: genericAssets[usdcAddress].price.value },
    };
  }

  // console.log(USDcAsset);

  const {
    inputCurrency,
    previousInputCurrency,
    navigateToSelectInputCurrency,
  } = useHolyDepositCurrencies({
    defaultInputCurrency: defaultInputCurrency,
    inputHeaderTitle: 'Choose currency',
    outputCurrency: USDcAsset,
  });

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
  const { maxInputBalance, updateMaxInputBalance } = useMaxInputBalance();

  useAndroidBackHandler(() => {
    navigate(Routes.WALLET_SCREEN);
    return true;
  });

  const {
    handleFocus,
    inputFieldRef,
    lastFocusedInputHandle,
    nativeFieldRef,
    outputFieldRef,
  } = useSwapInputRefs({
    inputCurrency: inputCurrency,
    outputCurrency: USDcAsset,
  });

  const {
    inputAmount,
    isDepositMax,
    isMax,
    isSufficientBalance,
    isSufficientLiquidity,
    isLoading,
    nativeAmount,
    outputAmount,
    transferError,
    transferData,
    updateInputAmount,
    updateNativeAmount,
  } = useHolyDepositInputs({
    inputCurrency,
    maxInputBalance: maxInputBalance,
    outputCurrency: USDcAsset,
    outputFieldRef,
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
      const gasLimit = await estimateHolySavingsDepositCompound({
        inputAmount,
        inputCurrency,
        transferData,
      });

      logger.log('new gas limit:', gasLimit);

      updateTxFee(gasLimit);
    } catch (error) {
      updateTxFee(defaultGasLimit);
    }
  }, [defaultGasLimit, inputAmount, inputCurrency, transferData, updateTxFee]);

  // Update gas limit
  useEffect(() => {
    updateGasLimit();
  }, [updateGasLimit]);

  const clearForm = useCallback(() => {
    logger.log('[exchange] - clear form');
    inputFieldRef?.current?.clear();
    nativeFieldRef?.current?.clear();
    outputFieldRef?.current?.clear();
    updateInputAmount();
    updateMaxInputBalance();
  }, [
    inputFieldRef,
    nativeFieldRef,
    outputFieldRef,
    updateInputAmount,
    updateMaxInputBalance,
  ]);

  // Clear form and reset max input balance on new input currency
  useEffect(() => {
    if (isNewValueForPath(inputCurrency, previousInputCurrency, 'address')) {
      clearForm();
      updateMaxInputBalance(inputCurrency);
    }
  }, [clearForm, inputCurrency, previousInputCurrency, updateMaxInputBalance]);

  useEffect(() => {
    return () => {
      dispatch(multicallClearState());
    };
  }, [dispatch]);

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
    updateInputAmount(maxInputBalance, true);
  }, [updateInputAmount, maxInputBalance]);

  const handleSubmit = useCallback(() => {
    backgroundTask.execute(async () => {
      setIsAuthorizing(true);
      try {
        const wallet = await loadWallet();
        if (!wallet) {
          setIsAuthorizing(false);
          logger.sentry(`aborting holy savings deposit due to missing wallet`);
          return;
        }

        const callback = () => {
          setParams({ focused: false });
          navigate(Routes.PROFILE_SCREEN);
        };
        const rap = await createHolySavingsDepositCompoundRap({
          callback,
          inputAmount,
          inputCurrency,
          isMax,
          outputCurrency: USDcAsset,
          selectedGasPrice,
          transferData,
        });
        logger.log('[holy savings deposit] rap', rap);
        await executeRap(wallet, rap);
        logger.log('[holy savings deposit] executed rap!');
        setIsAuthorizing(false);
      } catch (error) {
        setIsAuthorizing(false);
        logger.log('[holy savings deposit] error submitting', error);
        setParams({ focused: false });
        navigate(Routes.WALLET_SCREEN);
      }
    });
  }, [
    inputAmount,
    inputCurrency,
    isMax,
    USDcAsset,
    selectedGasPrice,
    transferData,
    setParams,
    navigate,
  ]);

  return (
    <Wrapper>
      <Centered
        {...(ios
          ? position.sizeAsObject('100%')
          : { style: { height: 500, top: 0 } })}
        backgroundColor={colors.transparent}
        direction="column"
      >
        {isLoading && (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: colors.pageBackground,
              flex: 1,
              height: '100%',
              justifyContent: 'center',
              left: 0,
              opacity: 0.5,
              position: 'absolute',
              top: 0,
              width: '100%',
              zIndex: 9999,
            }}
          >
            <ActivityIndicator color="#FFFFFF" size="large" />
          </View>
        )}

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
              title="Deposit"
            />
            <ExchangeInputField
              debounce={700}
              inputAmount={inputAmount}
              inputCurrencyAddress={get(inputCurrency, 'address', null)}
              inputCurrencySymbol={get(inputCurrency, 'symbol', null)}
              inputFieldRef={inputFieldRef}
              nativeAmount={nativeAmount}
              nativeCurrency={nativeCurrency}
              nativeFieldRef={nativeFieldRef}
              onFocus={handleFocus}
              onPressMaxBalance={handlePressMaxBalance}
              onPressSelectInputCurrency={navigateToSelectInputCurrency}
              setInputAmount={updateInputAmount}
              setNativeAmount={updateNativeAmount}
              showNative
              testID={testID + '-input'}
            />
          </FloatingPanel>

          <DepositSwapInfo
            amount={outputAmount}
            asset={USDcAsset}
            hide={inputCurrency && inputCurrency.address === USDcAsset.address}
            testID="migrate-info-button"
          />

          <DepositMaxAmountInfo isDepositMax={isDepositMax} />

          <Fragment>
            <Centered
              flexShrink={0}
              paddingHorizontal={15}
              paddingTop={24}
              width="100%"
            >
              <ConfirmExchangeButton
                disabled={!Number(inputAmount) || isDepositMax}
                isAuthorizing={isAuthorizing}
                isDeposit={false}
                isSufficientBalance={isSufficientBalance}
                isSufficientGas={isSufficientGas}
                isSufficientLiquidity={isSufficientLiquidity}
                onSubmit={handleSubmit}
                testID={testID + '-confirm'}
                transferError={transferError}
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

export default ExchangeNavigatorFactory(HolySavingsDepositModalWrapper);
