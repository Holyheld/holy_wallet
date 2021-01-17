import { Contract } from '@ethersproject/contracts';
import { useRoute } from '@react-navigation/native';
import BigNumber from 'bignumber.js';
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
import MigrateBonusInfo from '../components/holy-migrate/MigrateBonusInfo';
import MigrateInfo from '../components/holy-migrate/MigrateInfo';
import {
  Centered,
  ColumnWithMargins,
  KeyboardFixedOpenLayout,
  Row,
  RowWithMargins,
} from '../components/layout';
import { web3Provider } from '../handlers/web3';
import exchangeModalTypes from '../helpers/exchangeModalTypes';
import {
  add,
  convertAmountToNativeAmount,
  fromWei,
  greaterThan,
  lessThan,
  multiply,
  subtract,
  updatePrecisionToDisplay,
} from '../helpers/utilities';
import { loadWallet } from '../model/wallet';
import { useNavigation } from '../navigation/Navigation';
import useStatusBarManaging from '../navigation/useStatusBarManaging';
import { executeRap } from '../raps/common';
import createHolyMigrateCompoundRap, {
  estimateHolyMigrateCompound,
} from '../raps/holyMigrateCompound';
import { multicallClearState } from '../redux/multicall';
import {
  HH_V2_ADDRESS,
  HOLY_PASSAGE_ABI,
  HOLY_PASSAGE_ADDRESS,
  HOLY_VISOR_ABI,
  HOLY_VISOR_ADDRESS,
} from '../references/holy';
import {
  useAccountSettings,
  useBlockPolling,
  useGas,
} from '@holyheld-com/hooks';
import Routes from '@holyheld-com/routes';
import { colors, position } from '@holyheld-com/styles';
import { backgroundTask } from '@holyheld-com/utils';

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
  const { network, accountAddress } = useAccountSettings();

  const [isLoading, setIsLoading] = useState(true);
  const { nativeCurrency } = useAccountSettings();

  const [bonusMigrateNeed, setBonusMigrateNeed] = useState(0);
  const [bonusClaimable, setBonusCLaimable] = useState(0);

  const amountToMigrate = get(holyV1Asset, 'balance.amount');

  useEffect(() => {
    async function loadMigrationData() {
      logger.log('Loading migrate data...');

      try {
        const visorAddress = HOLY_VISOR_ADDRESS(network);
        const visorABI = HOLY_VISOR_ABI;

        const holyVisor = new Contract(visorAddress, visorABI, web3Provider);

        const passageAddress = HOLY_PASSAGE_ADDRESS(network);
        const passageABI = HOLY_PASSAGE_ABI;

        const holyPassage = new Contract(
          passageAddress,
          passageABI,
          web3Provider
        );

        logger.log('loading migration data');
        let bonusAmountCap = await holyVisor.bonusAmountCaps(accountAddress, {
          from: accountAddress,
        });
        logger.log('bonus cap HEX:', bonusAmountCap);
        if (bonusAmountCap) {
          bonusAmountCap = bonusAmountCap.toString();
        } else {
          bonusAmountCap = '0';
        }
        logger.log('bonus cap:', bonusAmountCap);

        let migratedTokens = await holyPassage.migratedTokens(accountAddress, {
          from: accountAddress,
        });
        logger.log('migrated tokens HEX:', migratedTokens);
        if (migratedTokens) {
          migratedTokens = migratedTokens.toString();
        } else {
          migratedTokens = '0';
        }
        logger.log('migrated tokens:', migratedTokens);
        const amountToMigratedWEI = multiply(
          amountToMigrate,
          new BigNumber(10).pow(18)
        );
        logger.log('amount to migrate in wei:', amountToMigratedWEI);

        const migratedPlusCurrent = add(migratedTokens, amountToMigratedWEI);
        logger.log(
          'migrated tokens plus current migration amount:',
          migratedPlusCurrent
        );

        if (lessThan(migratedPlusCurrent, bonusAmountCap)) {
          let needForBonus = subtract(bonusAmountCap, migratedPlusCurrent);

          needForBonus = fromWei(needForBonus);
          logger.log(
            'cap is less than migrated tokens - you need ',
            needForBonus,
            ' for full bonus'
          );
          setBonusMigrateNeed(needForBonus);
        } else {
          logger.log(
            'cap is bigger than migrated and ready for migrate tokens - bonus already is max'
          );
          setBonusMigrateNeed('0');
        }

        let claimableMigrationBonus = await holyPassage.getClaimableMigrationBonus(
          {
            from: accountAddress,
          }
        );
        logger.sentry(
          'claimable migration bonus HEX:',
          claimableMigrationBonus
        );
        if (claimableMigrationBonus) {
          claimableMigrationBonus = claimableMigrationBonus.toString();
        } else {
          claimableMigrationBonus = '0';
        }
        claimableMigrationBonus = fromWei(claimableMigrationBonus);
        logger.sentry('claimable migration bonus:', claimableMigrationBonus);
        setBonusCLaimable(claimableMigrationBonus);

        setIsLoading(false);
      } catch (error) {
        logger.sentry('loading migration data error: ', error);
        setBonusMigrateNeed(0);
        setIsLoading(false);
      }
    }
    loadMigrationData();
  }, [accountAddress, amountToMigrate, network]);

  const symbol = get(holyV1Asset, 'symbol');
  const address = get(holyV1Asset, 'address');

  const hhCoinV2 = {
    address: HH_V2_ADDRESS(network), // from testnet
    symbol: 'HH',
    type: 'token',
  };

  const newNativePrice = get(holyV1Asset, 'native.price.amount', null);
  const nativeAmount = convertAmountToNativeAmount(
    amountToMigrate,
    newNativePrice
  );

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

  const amountToMigrateDisplay = useMemo(
    () => updatePrecisionToDisplay(amountToMigrate, newNativePrice, true),
    [amountToMigrate, newNativePrice]
  );

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
        setIsAuthorizing(false);
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
                title="Migrate"
              />
              <Container>
                <InnerContainer>
                  <FieldRow>
                    <CoinIcon
                      address={address}
                      size={CoinSize}
                      symbol={symbol}
                    />

                    <Input editable={false} value={amountToMigrateDisplay} />
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
            <MigrateInfo
              amount={amountToMigrate}
              asset={hhCoinV2}
              bonusAmount={bonusClaimable}
              testID="migrate-info-button"
            />
            <MigrateBonusInfo
              amount={bonusMigrateNeed}
              asset={holyV1Asset}
              testID="migrate-bonus-info-button"
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
                  isSufficientBalance={greaterThan(amountToMigrate, '0')}
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

export default HolyMigrateModalWrapper;
