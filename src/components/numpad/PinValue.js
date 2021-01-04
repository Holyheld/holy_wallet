import React from 'react';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/primitives';
import { Column, Flex } from '../../components/layout';
import { colors } from '@rainbow-me/styles';

const FilledValue = styled(Column)`
  background-color: ${colors.textColorPrimary};
  width: 20;
  height: 20;
  border-radius: 20;
  margin-left: 10;
  margin-right: 10;
`;

const EmptyValue = styled(Column)`
  border-width: 3;
  width: 20;
  height: 20;
  border-color: ${colors.textColorPrimaryMuted};
  border-radius: 20;
  margin-left: 10;
  margin-right: 10;
`;

const PinValue = ({ translateX, value, ...props }) => {
  return (
    <Flex {...props}>
      <Animated.View
        style={{
          flexDirection: 'row',
          transform: [{ translateX }],
        }}
      >
        {value && value.length ? <FilledValue /> : <EmptyValue />}
        {value && value.length > 1 ? <FilledValue /> : <EmptyValue />}
        {value && value.length > 2 ? <FilledValue /> : <EmptyValue />}
        {value && value.length > 3 ? <FilledValue /> : <EmptyValue />}
      </Animated.View>
    </Flex>
  );
};

export default React.memo(PinValue);
