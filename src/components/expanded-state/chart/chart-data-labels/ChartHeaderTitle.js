import styled from 'styled-components/primitives';
import { TruncatedText } from '../../../text';
import { colors } from '@holyheld-com/styles';

const ChartHeaderTitle = styled(TruncatedText).attrs(
  ({ color = colors.text }) => ({
    color,
    letterSpacing: 'roundedTight',
    size: 'big',
    weight: 'bold',
  })
)``;

export default ChartHeaderTitle;
