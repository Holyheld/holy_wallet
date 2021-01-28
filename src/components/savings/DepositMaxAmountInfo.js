import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import {
  bin,
  useSpringTransition,
  useTimingTransition,
} from 'react-native-redash';
import styled from 'styled-components/primitives';
import { interpolate } from '../animations';
import { Icon } from '../icons';
import { Centered } from '../layout';
import { Text } from '../text';
import { colors, padding } from '@holyheld-com/styles';

const Container = styled(Centered)`
  ${padding(0, 30, 0, 30)};
  width: 100%;
`;

const WarningIcon = styled(Icon).attrs({
  color: colors.orangeLight,
  name: 'warning',
})`
  box-shadow: 0px 4px 6px ${colors.alpha(colors.orangeLight, 0.4)};
  margin-top: 1;
  margin-right: 10px;
`;

const DepositMaxAmoutInfo = ({ isDepositMax }) => {
  const isVisible = useMemo(() => {
    return isDepositMax;
  }, [isDepositMax]);

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
        marginBottom: isVisible ? 5 : 0,
        marginTop: isVisible ? 19 : 0,
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
        <WarningIcon />
        <Text
          align="center"
          color={colors.textColorMuted}
          size="smedium"
          weight="medium"
        >
          We are currently limiting the maximum deposit size to optimize
          performance.
        </Text>
      </Container>
    </Animated.View>
  );
};

DepositMaxAmoutInfo.propTypes = {
  isDepositMax: PropTypes.bool,
};

export default DepositMaxAmoutInfo;
