import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import Animated from 'react-native-reanimated';
import {
  bin,
  useSpringTransition,
  useTimingTransition,
} from 'react-native-redash';
import styled from 'styled-components/primitives';
import colors from '../../styles/colors';
import { interpolate } from '../animations';
import { Centered } from '../layout';
import { Text } from '../text';
import { padding } from '@holyheld-com/styles';

const Container = styled(Centered)`
  ${padding(19, 19, 2)};
  width: 100%;
`;

const ClaimInfo = ({ asset, amount }) => {
  const isVisible = !!(asset && amount);
  const symbol = get(asset, 'symbol');

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
        <Text color={colors.textColorMuted} size="smedium" weight="medium">
          Exiting for{' '}
        </Text>
        <Text color={colors.textColor} size="smedium" weight="semibold">
          {`${amountToDisplay}  ${symbol}`}
        </Text>
      </Container>
    </Animated.View>
  );
};

ClaimInfo.propTypes = {
  amount: PropTypes.number,
  asset: PropTypes.object,
};

export default ClaimInfo;
