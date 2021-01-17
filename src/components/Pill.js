import React from 'react';
import RadialGradient from 'react-native-radial-gradient';
import styled from 'styled-components/primitives';
import { TruncatedText } from './text';
import { colors, padding } from '@holyheld-com/styles';

const borderRadius = 10.5;

const Gradient = styled(RadialGradient).attrs({
  center: [0, borderRadius],
  colors: [colors.buttonSecondary, colors.buttonSecondary],
})`
  ${padding(2, 6)};
  border-radius: ${borderRadius};
  overflow: hidden;
`;

export default function Pill({ children, ...props }) {
  return (
    <Gradient {...props}>
      <TruncatedText
        align="center"
        color={colors.textColorSecondaryButton}
        letterSpacing="uppercase"
        size="smedium"
        weight="semibold"
      >
        {children}
      </TruncatedText>
    </Gradient>
  );
}
