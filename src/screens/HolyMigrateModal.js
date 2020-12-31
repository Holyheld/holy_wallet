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
import MigrateInfo from '../components/holy-migrate/MigrateInfo';
import { Centered, KeyboardFixedOpenLayout } from '../components/layout';
import exchangeModalTypes from '../helpers/exchangeModalTypes';
import useHolyMigrateInputs from '../hooks/useHolyMigrateInputs';
import { loadWallet } from '../model/wallet';
import { useNavigation } from '../navigation/Navigation';
import useStatusBarManaging from '../navigation/useStatusBarManaging';
import { executeRap } from '../raps/common';
import createHolyMigrateCompoundRap, {
  estimateHolyMigrateCompound,
} from '../raps/holyMigrateCompound';
import { multicallClearState } from '../redux/multicall';
import {
  useAccountSettings,
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

const HolyMigrateModalWrapper = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  android && useStatusBarManaging();
  const { params } = useRoute();
  const balance = params?.balance;
  const testID = params?.testID;
  return <HolyMigrateModal balance={balance} testID={testID} />;
};

const HolyMigrateModal = ({ balance, testID }) => {
  const {
    navigate,
    setParams,
    dangerouslyGetParent,
    addListener,
  } = useNavigation();
  const {
    params: { tabTransitionPosition },
  } = useRoute();

  const maxInputBalance = balance;
  const defaultGasLimit = 10000;
  const createRap = createHolyMigrateCompoundRap;
  const estimateRap = estimateHolyMigrateCompound;
  const type = exchangeModalTypes.holyMigrate;
  const inputCurrency = {
    address: '0x39eae99e685906ff1c11a962a743440d0a1a6e09',
    native: {
      price: {
        amount: 10, // price of one HOLY
      },
    },
    symbol: 'HOLY',
  };

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
    // isMax,
    isSufficientBalance,
    nativeAmount,
    // outputAmount,
    // outputAmountDisplay,
    // setIsSufficientBalance,
    updateInputAmount,
    updateNativeAmount,
    // updateOutputAmount,
  } = useHolyMigrateInputs({
    inputCurrency,
    maxInputBalance,
    nativeFieldRef,
    supplyBalanceUnderlying: balance,
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
    updateInputAmount(balance);
  }, [updateInputAmount, balance]);

  const handleSubmit = useCallback(() => {
    backgroundTask.execute(async () => {
      setIsAuthorizing(true);
      try {
        const wallet = await loadWallet();
        if (!wallet) {
          setIsAuthorizing(false);
          logger.sentry(`aborting holy migrate due to missing wallet`);
          return;
        }

        setIsAuthorizing(false);
        const callback = () => {
          setParams({ focused: false });
          navigate(Routes.PROFILE_SCREEN);
        };
        const rap = await createRap({
          callback,
          inputAmount,
          selectedGasPrice,
        });
        logger.log('[holy migrate] rap', rap);
        await executeRap(wallet, rap);
        logger.log('[holy migrate] executed rap!');
      } catch (error) {
        setIsAuthorizing(false);
        logger.log('[holy migrate] error submitting migrate', error);
        setParams({ focused: false });
        navigate(Routes.WALLET_SCREEN);
      }
    });
  }, [createRap, inputAmount, selectedGasPrice, setParams, navigate]);

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
              title="Migrate"
            />
            <ExchangeInputField
              disableInputCurrencySelection
              inputAmount={inputAmount}
              inputCurrencyAddress={get(inputCurrency, 'address', null)}
              inputCurrencySymbol={get(inputCurrency, 'symbol', null)}
              inputFieldRef={inputFieldRef}
              nativeAmount={nativeAmount}
              nativeCurrency={nativeCurrency}
              nativeFieldRef={nativeFieldRef}
              onFocus={handleFocus}
              onPressMaxBalance={handlePressMaxBalance}
              onPressSelectInputCurrency={() => {}}
              setInputAmount={updateInputAmount}
              setNativeAmount={updateNativeAmount}
              testID={testID + '-input'}
            />
          </FloatingPanel>
          <MigrateInfo
            amount={(inputAmount > 0 && inputAmount) || null}
            asset={{
              symbol: 'HH',
            }}
            testID="migrate-info-button"
          />

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

export default HolyMigrateModalWrapper;
