import SvgPrimitive from 'react-native-svg';
import styled from 'styled-components/primitives';
import { calcDirectionToDegrees } from '@holyheld-com/styles';

const Svg = styled(SvgPrimitive).withConfig({
  shouldForwardProp: prop => prop !== 'direction',
})`
  transform: rotate(${({ direction }) => calcDirectionToDegrees(direction)}deg);
`;

export default Svg;
