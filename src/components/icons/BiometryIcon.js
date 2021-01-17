import React from 'react';
import styled from 'styled-components/primitives';
import { Centered } from '../layout';
import Icon from './Icon';
import BiometryTypes from '@holyheld-com/helpers/biometryTypes';
import { colors, position } from '@holyheld-com/styles';
import { magicMemo } from '@holyheld-com/utils';

const BiometryTypeIcon = styled(Icon).attrs(
  ({ type, color = colors.textColor }) => ({
    color: color,
    name: type.toLowerCase(),
  })
)`
  ${position.size('100%')}
`;

const Container = styled(Centered).attrs({
  align: 'start',
})`
  ${({ type }) =>
    type === BiometryTypes.FaceID || type === BiometryTypes.Face
      ? `
        ${position.size(27)};
        margin-bottom: 2;
        margin-left: 4;
      `
      : ''}

  ${({ type }) =>
    type === BiometryTypes.passcode
      ? `
        height: 25;
        margin-bottom: 4;
        margin-left: 4;
        width: 18;
      `
      : ''}

  ${({ type }) =>
    type === BiometryTypes.TouchID || type === BiometryTypes.Fingerprint
      ? `
        ${position.size(31)};
        margin-bottom: 1;
      `
      : ''}
`;

const BiometryIcon = ({ biometryType, color = colors.textColor, ...props }) =>
  !biometryType || biometryType === 'none' ? null : (
    <Container {...props} type={biometryType}>
      <BiometryTypeIcon color={color} type={biometryType} />
    </Container>
  );

export default magicMemo(BiometryIcon, 'biometryType');
