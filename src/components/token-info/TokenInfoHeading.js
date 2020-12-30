import styled from 'styled-components/primitives';
import { Text } from '../text';
import { colors } from '@rainbow-me/styles';

const TokenInfoHeading = styled(Text).attrs({
  color: colors.textColor,
  letterSpacing: 'roundedMedium',
  size: 'smedium',
  weight: 'semibold',
})``;

export default TokenInfoHeading;
