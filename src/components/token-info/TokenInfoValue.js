import styled from 'styled-components/primitives';
import { TruncatedText } from '../text';
import { colors } from '@holyheld-com/styles';

const TokenInfoValue = styled(TruncatedText).attrs(
  ({ color = colors.textColor, weight = 'semibold' }) => ({
    color,
    letterSpacing: 'roundedTight',
    size: 'larger',
    weight,
  })
)``;

export default TokenInfoValue;
