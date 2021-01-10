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
  SlippageWarning,
} from '../components/exchange';
import { FloatingPanel, FloatingPanels } from '../components/floating-panels';
import { GasSpeedButton } from '../components/gas';
import { Centered, KeyboardFixedOpenLayout } from '../components/layout';
import exchangeModalTypes from '../helpers/exchangeModalTypes';
import useSavingsWithBalanceWithSelections from '../hooks/useHolySavings';
import { loadWallet } from '../model/wallet';
import { useNavigation } from '../navigation/Navigation';
import useStatusBarManaging from '../navigation/useStatusBarManaging';
import { executeRap } from '../raps/common';
import createHolySavingsWithdrawCompoundRap, {
  estimateHolySavingsWithdrawCompound,
} from '../raps/holySavingsWithdrawCompound';
import { multicallClearState } from '../redux/multicall';
import {
  useAccountSettings,
  useBlockPolling,
  useGas,
  useSwapInputRefs,
  useSwapInputs,
} from '@rainbow-me/hooks';
import Routes from '@rainbow-me/routes';
import { colors, position } from '@rainbow-me/styles';
import { backgroundTask } from '@rainbow-me/utils';

import logger from 'logger';

const AnimatedFloatingPanels = Animated.createAnimatedComponent(FloatingPanels);
const Wrapper = ios ? KeyboardFixedOpenLayout : Fragment;

const HolySavingsWithdrawModalWrapper = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  android && useStatusBarManaging();
  const { params } = useRoute();
  const savings = params?.savings;
  const currentSavings = params?.currentSavings;

  const testID = params?.testID;
  return (
    <HolySavingsWithdrawModal
      currentSavings={currentSavings}
      savings={savings}
      testID={testID}
    />
  );
};

const HolySavingsWithdrawModal = ({ currentSaving, testID }) => {
  const {
    navigate,
    setParams,
    dangerouslyGetParent,
    addListener,
  } = useNavigation();
  const {
    params: { tabTransitionPosition },
  } = useRoute();

  const maxInputBalance = currentSaving.balance;

  const defaultGasLimit = 10000;

  const createRap = createHolySavingsWithdrawCompoundRap;
  const estimateRap = estimateHolySavingsWithdrawCompound;
  const type = exchangeModalTypes.holyWithdraw;
  // useAsset - to get data from uniswap about this asset
  // const inputCurrency = useMemo(
  //   () => ({
  //     address: currentSavings.underlying.address,
  //     native: {
  //       price: {
  //         amount: 10, // price of one saving
  //       },
  //     },
  //     symbol: currentSavings.underlying.symbol,
  //   }),
  //   [currentSavings]
  // );

  const {
    inputCurrency,
    navigateToSelectInputSaving,
  } = useSavingsWithBalanceWithSelections({
    defaultInputSaving: currentSaving,
    inputHeaderTitle: 'choose saving',
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
  const { nativeCurrency } = useAccountSettings();

  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [slippage] = useState(null);

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
    inputCurrency: inputCurrency,
  });

  const {
    inputAmount,
    // inputAmountDisplay,
    // inputAsExactAmount,
    isMax,
    isSufficientBalance,
    nativeAmount,
    // outputAmount,
    // outputAmountDisplay,
    // setIsSufficientBalance,
    updateInputAmount,
    updateNativeAmount,
    // updateOutputAmount,
  } = useSwapInputs({
    inputCurrency,
    maxInputBalance,
    nativeFieldRef,
    supplyBalanceUnderlying: currentSaving.balance,
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
      const gasLimit = await estimateRap({
        inputAmount,
      });

      updateTxFee(gasLimit);
    } catch (error) {
      updateTxFee(defaultGasLimit);
    }
  }, [defaultGasLimit, estimateRap, inputAmount, updateTxFee]);

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

  const isSlippageWarningVisible = isSufficientBalance && !!inputAmount;

  const handlePressMaxBalance = useCallback(async () => {
    updateInputAmount(currentSaving.balance);
  }, [updateInputAmount, currentSaving]);

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
        const rap = await createRap({
          callback,
          inputAmount,
          inputCurrency,
          isMax,
          selectedGasPrice,
        });
        logger.log('[holy savings withdraw] rap', rap);
        await executeRap(wallet, rap);
        logger.log('[holy savings withdraw] executed rap!');
        setIsAuthorizing(false);
      } catch (error) {
        setIsAuthorizing(false);
        logger.log('[holy savings withdrawe] error submitting migrate', error);
        setParams({ focused: false });
        navigate(Routes.WALLET_SCREEN);
      }
    });
  }, [
    createRap,
    inputAmount,
    selectedGasPrice,
    setParams,
    navigate,
    isMax,
    inputCurrency,
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
              inputAmount={inputAmount}
              inputCurrencyAddress={get(inputCurrency, 'address', null)}
              inputCurrencySymbol={get(inputCurrency, 'symbol', null)}
              inputFieldRef={inputFieldRef}
              nativeAmount={nativeAmount}
              nativeCurrency={nativeCurrency}
              nativeFieldRef={nativeFieldRef}
              onFocus={handleFocus}
              onPressMaxBalance={handlePressMaxBalance}
              onPressSelectInputCurrency={navigateToSelectInputSaving}
              setInputAmount={updateInputAmount}
              setNativeAmount={updateNativeAmount}
              testID={testID + '-input'}
            />
          </FloatingPanel>

          {isSlippageWarningVisible && <SlippageWarning slippage={slippage} />}

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
                slippage={slippage}
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

export default HolySavingsWithdrawModalWrapper;
