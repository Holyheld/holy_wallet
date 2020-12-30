import analytics from '@segment/analytics-react-native';
import PropTypes from 'prop-types';

import React, { useCallback, useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { IS_TESTING } from 'react-native-dotenv';
// import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/primitives';

import { ButtonPressAnimation } from '../animations';
import { Centered, Row } from '../layout';
import { Emoji } from '../text';
import APYPill from './APYPill';
import SavingsListRowAnimatedNumber from './SavingsListRowAnimatedNumber';
import SavingsListRowEmptyState from './SavingsListRowEmptyState';
import { formatSavingsAmount } from '@rainbow-me/helpers/savings';
import { useDimensions } from '@rainbow-me/hooks';
import { colors, padding } from '@rainbow-me/styles';
import ShadowStack from 'react-native-shadow-stack';

const ANIMATE_NUMBER_INTERVAL = 60;

const SavingsListRowShadows = [
  [0, 10, 30, colors.dark, 0.1],
  [0, 5, 15, colors.dark, 0.04],
];

const NOOP = () => undefined;

const neverRerender = () => true;
// eslint-disable-next-line react/display-name
const SavingsListRowGradient = React.memo(
  () => (
    // <LinearGradient
    //   borderRadius={49}
    //   colors={['#FFFFFF', '#F7F9FA']}
    //   end={{ x: 0.5, y: 1 }}
    //   pointerEvents="none"
    //   start={{ x: 0.5, y: 0 }}
    //   style={position.coverAsObject}
    // />
    <></>
  ),
  neverRerender
);

const SavingsListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    borderRadius: 49,
    height: 49,
    shadows: SavingsListRowShadows,
    width: deviceWidth - 38,
  })
)``;

const SavingsListRow = ({ balance, underlying }) => {
  const { width: deviceWidth } = useDimensions();
  //const { navigate } = useNavigation();

  const initialValue = balance;
  const [value] = useState(initialValue);
  const [steps] = useState(0);

  const onButtonPress = useCallback(() => {
    // navigate(Routes.SAVINGS_SHEET, {
    //   cTokenBalance,
    //   isEmpty: !supplyBalanceUnderlying,
    //   lifetimeSupplyInterestAccrued,
    //   lifetimeSupplyInterestAccruedNative,
    //   longFormHeight: supplyBalanceUnderlying
    //     ? SavingsSheetHeight
    //     : SavingsSheetEmptyHeight,
    //   supplyBalanceUnderlying,
    //   supplyRate,
    //   underlying,
    //   underlyingBalanceNativeValue,
    //   underlyingPrice,
    // });
    // analytics.track('Opened Savings Sheet', {
    //   category: 'savings',
    //   empty: !supplyBalanceUnderlying,
    //   label: underlying.symbol,
    // });
  }, []);

  // useEffect(() => {
  //   if (!supplyBalanceUnderlying) return;

  //   const futureValue = calculateCompoundInterestInDays(
  //     initialValue,
  //     supplyRate,
  //     1
  //   );

  //   if (!BigNumber(futureValue).eq(value)) {
  //     setValue(futureValue);
  //     setSteps(MS_IN_1_DAY / ANIMATE_NUMBER_INTERVAL);
  //   }
  // }, [
  //   apy,
  //   initialValue,
  //   supplyBalanceUnderlying,
  //   supplyRate,
  //   underlying,
  //   value,
  // ]);

  useEffect(() => {
    if (underlying && underlying.symbol && balance)
      InteractionManager.runAfterInteractions(() => {
        analytics.track('User has savings', {
          category: 'savings',
          label: underlying.symbol,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayValue = formatSavingsAmount(value);

  return !underlying ? null : (
    <ButtonPressAnimation
      onPress={onButtonPress}
      overflowMargin={10}
      scaleTo={0.96}
    >
      <Centered direction="column" marginBottom={15}>
        <SavingsListRowShadowStack deviceWidth={deviceWidth}>
          <SavingsListRowGradient />
          <Row
            align="center"
            css={padding(9, 10, 10, 20)}
            justify="space-between"
            onPress={() => {}}
            scaleTo={0.96}
          >
            <Centered>
              <Emoji lineHeight="none" name="flag_united_states" size={20} />
            </Centered>
            {balance && !isNaN(displayValue) && IS_TESTING !== 'true' ? (
              <SavingsListRowAnimatedNumber
                initialValue={initialValue}
                interval={ANIMATE_NUMBER_INTERVAL}
                steps={steps}
                symbol={underlying.symbol}
                value={displayValue}
              />
            ) : (
              <SavingsListRowEmptyState onPress={NOOP} />
            )}
            <APYPill value="2.96" />
          </Row>
        </SavingsListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

SavingsListRow.propTypes = {
  balance: PropTypes.string,
  underlying: PropTypes.object,
};

export default React.memo(SavingsListRow);
