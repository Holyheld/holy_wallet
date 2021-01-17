import React from 'react';
import styled from 'styled-components/primitives';
import { magicMemo } from '../../utils';
import { OpacityToggler } from '../animations';
import { Text } from '../text';
import { colors } from '@holyheld-com/styles';

const LabelText = styled(Text).attrs({
  color: colors.textColorSecondaryButton,
  letterSpacing: 'roundedTight',
  size: 'lmedium',
  weight: 'bold',
})`
  position: absolute;
  top: ${android ? -15.25 : -10.25};
`;

const CoinDividerButtonLabel = ({ isVisible, label }) => (
  <OpacityToggler isVisible={isVisible}>
    <LabelText>{label}</LabelText>
  </OpacityToggler>
);

export default magicMemo(CoinDividerButtonLabel, 'isVisible');
