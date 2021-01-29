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
import { interpolate } from '../animations';
import { CoinIcon } from '../coin-icon';
import { Centered } from '../layout';
import { Text } from '../text';
import { colors, padding } from '@holyheld-com/styles';

const Container = styled(Centered)`
  ${padding(19, 19, 2)};
  width: 100%;
`;

const DepositSwapInfo = ({ asset, amount, hide }) => {
  const isVisible = !!(asset && amount && !hide);
  const symbol = get(asset, 'symbol');
  const address = get(asset, 'address');

  const { displayedAmount } = useMemo(() => {
    const displayedAmount = new BigNumber(amount).decimalPlaces(2).toString();
    return {
      displayedAmount,
    };
  }, [amount]);

  const prevAmountRef = useRef();
  useEffect(() => {
    // Need to remember the amount so
    // it doesn't show NULL while fading out!
    if (displayedAmount !== null) {
      prevAmountRef.current = displayedAmount;
    }
  });

  const prevAmount = prevAmountRef.current;
  let amountToDisplay = displayedAmount;
  if (displayedAmount === null) {
    amountToDisplay = prevAmount;
  }

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
      testID="claim-info"
    >
      <Container>
        <CoinIcon
          address={address}
          flex={0}
          marginRight={5}
          size={20}
          symbol={symbol}
          testID="claim-info-container"
        />
        <Text color={colors.textColorMuted} size="smedium" weight="medium">
          Swapping for{' '}
        </Text>
        <Text color={colors.textColor} size="smedium" weight="semibold">
          {`${amountToDisplay}  ${symbol}`}
        </Text>
      </Container>
    </Animated.View>
  );
};

DepositSwapInfo.propTypes = {
  amount: PropTypes.number,
  asset: PropTypes.object,
};

export default DepositSwapInfo;
