import React from 'react';
import { UIActivityIndicator } from 'react-native-indicators';
import styled from 'styled-components/primitives';
import { Centered } from './layout';
import { colors, position } from '@holyheld-com/styles';

const Container = styled(Centered)`
  ${({ size }) => position.size(Number(size))};
`;

export default function ActivityIndicator({
  color = colors.textColorPrimary,
  isInteraction = false,
  size = 25,
  ...props
}) {
  return (
    <Container size={size} {...props}>
      <UIActivityIndicator
        color={color}
        interaction={isInteraction}
        size={size}
      />
    </Container>
  );
}
