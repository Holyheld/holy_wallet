import { useRoute } from '@react-navigation/native';
import { get } from 'lodash';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import Animated, { Extrapolate } from 'react-native-reanimated';
import { useAndroidBackHandler } from 'react-navigation-backhandler';
import { useDispatch } from 'react-redux';
import styled from 'styled-components/primitives';
import { interpolate } from '../components/animations';
import { CoinIcon } from '../components/coin-icon';
import {
  ConfirmExchangeButton,
  ExchangeModalHeader,
} from '../components/exchange';
import ExchangeInput from '../components/exchange/ExchangeInput';
import { FloatingPanel, FloatingPanels } from '../components/floating-panels';
import { GasSpeedButton } from '../components/gas';
import MigrateInfo from '../components/holy-migrate/MigrateInfo';
import {
  Centered,
  ColumnWithMargins,
  KeyboardFixedOpenLayout,
  Row,
  RowWithMargins,
} from '../components/layout';
import exchangeModalTypes from '../helpers/exchangeModalTypes';
import { loadWallet } from '../model/wallet';
import { useNavigation } from '../navigation/Navigation';
import useStatusBarManaging from '../navigation/useStatusBarManaging';
import { executeRap } from '../raps/common';
import createHolyMigrateCompoundRap, {
  estimateHolyMigrateCompound,
} from '../raps/holyMigrateCompound';
import { multicallClearState } from '../redux/multicall';
import { HH_V2_ADDRESS } from '../references/holy';
import { useAccountSettings, useBlockPolling, useGas } from '@rainbow-me/hooks';
import Routes from '@rainbow-me/routes';
import { colors, position } from '@rainbow-me/styles';
import { backgroundTask } from '@rainbow-me/utils';

import logger from 'logger';

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

const HolyMigrateModalWrapper = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  android && useStatusBarManaging();
  const { params } = useRoute();
  const holyV1Asset = params?.holyV1Asset;
  const testID = params?.testID;
  return <HolyMigrateModal holyV1Asset={holyV1Asset} testID={testID} />;
};

const HolyMigrateModal = ({ holyV1Asset, testID }) => {
  const { navigate, setParams } = useNavigation();
  const {
    params: { tabTransitionPosition },
  } = useRoute();
  const { network } = useAccountSettings();

  const amountToMigrate = get(holyV1Asset, 'balance.amount');
  const symbol = get(holyV1Asset, 'symbol');
  const address = get(holyV1Asset, 'address');

  const hhCoinV2 = {
    address: HH_V2_ADDRESS(network), // from testnet
    symbol: 'HH',
    type: 'token',
  };

  const defaultGasLimit = 160000;
  const type = exchangeModalTypes.holyMigrate;

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
      const gasLimit = await estimateHolyMigrateCompound(
        amountToMigrate,
        holyV1Asset
      );
      logger.sentry('new gas limit:', gasLimit);
      updateTxFee(gasLimit);
    } catch (error) {
      logger.sentry('gas limit error:', error);
      updateTxFee(defaultGasLimit);
    }
  }, [defaultGasLimit, updateTxFee, amountToMigrate, holyV1Asset]);

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
          logger.sentry(`aborting holy migrate due to missing wallet`);
          return;
        }

        setIsAuthorizing(false);
        const callback = () => {
          setParams({ focused: false });
          navigate(Routes.PROFILE_SCREEN);
        };
        const rap = await createHolyMigrateCompoundRap({
          amount: amountToMigrate,
          callback,
          currency: holyV1Asset,
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
  }, [amountToMigrate, selectedGasPrice, setParams, navigate, holyV1Asset]);

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
            <Container>
              <InnerContainer>
                <FieldRow>
                  <CoinIcon address={address} size={CoinSize} symbol={symbol} />

                  <Input editable={false} value={amountToMigrate} />
                </FieldRow>
              </InnerContainer>
            </Container>
          </FloatingPanel>
          <MigrateInfo
            amount={amountToMigrate}
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
      </Centered>
    </Wrapper>
  );
};

export default HolyMigrateModalWrapper;
