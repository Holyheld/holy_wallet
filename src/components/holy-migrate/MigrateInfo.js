import BigNumber from 'bignumber.js';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef } from 'react';
import Animated from 'react-native-reanimated';
import {
  bin,
  useSpringTransition,
  useTimingTransition,
} from 'react-native-redash';
import styled from 'styled-components/primitives';
import { greaterThan } from '../../helpers/utilities';
import { interpolate } from '../animations';
import { CoinIcon } from '../coin-icon';
import { Centered } from '../layout';
import { Text } from '../text';
import { colors, padding } from '@holyheld-com/styles';

const Container = styled(Centered)`
  ${padding(19, 19, 2)};
  width: 100%;
`;

const MigrateInfo = ({ asset, amount, bonusAmount }) => {
  const isVisible = !!(asset && amount);
  const symbol = get(asset, 'symbol');
  const address = get(asset, 'address');

  const prevAmountRef = useRef();
  useEffect(() => {
    // Need to remember the amount so
    // it doesn't show NULL while fading out!
    if (amount !== null) {
      prevAmountRef.current = amount;
    }
  });

  const prevAmount = prevAmountRef.current;
  let amountToDisplay = amount;
  if (amount === null) {
    amountToDisplay = prevAmount;
  }

  const amountToDisplayRounded = useMemo(
    () => new BigNumber(amountToDisplay).decimalPlaces(5).toString(),
    [amountToDisplay]
  );

  const bonusToDisplayRounded = useMemo(
    () => new BigNumber(bonusAmount).decimalPlaces(5).toString(),
    [bonusAmount]
  );

  const animation = useSpringTransition(bin(isVisible), {
    damping: 14,
    mass: 1,
    overshootClamping: false,
    restDisplacementThreshold: 0.001,
    restSpeedThreshold: 0.001,
    stiffness: 121.5,
  });
  const animationHeight = useTimingTransition(bin(isVisible), {
    duration: 100,
  });

  return (
    <Animated.View
      style={{
        height: interpolate(animationHeight, {
          inputRange: [0, 1],
          outputRange: [0, 35],
        }),
        opacity: interpolate(animation, {
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: [
          {
            scale: interpolate(animation, {
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
            translateY: interpolate(animation, {
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ],
      }}
      testID="swap-info"
    >
      <Container>
        <CoinIcon
          address={address}
          flex={0}
          marginRight={5}
          size={20}
          symbol={symbol}
          testID="swap-info-container"
        />
        <Text color={colors.textColorMuted} size="smedium" weight="medium">
          You will get{' '}
        </Text>
        <Text color={colors.textColor} size="smedium" weight="semibold">
          {`${amountToDisplayRounded}  ${symbol}`}
        </Text>
        {greaterThan(bonusAmount, '0') ? (
          <>
            <Text color={colors.textColorMuted} size="smedium" weight="medium">
              {' '}
              and{' '}
            </Text>
            <Text color={colors.textColor} size="smedium" weight="semibold">
              {`${bonusToDisplayRounded}  ${symbol}`}
            </Text>
          </>
        ) : (
          <></>
        )}
      </Container>
    </Animated.View>
  );
};

MigrateInfo.propTypes = {
  amount: PropTypes.number,
  asset: PropTypes.object,
};

export default MigrateInfo;
