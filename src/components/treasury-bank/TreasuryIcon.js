import React from 'react';
import FastImage from 'react-native-fast-image';
import styled from 'styled-components/primitives';
import borders from '../../styles/borders';
import colors from '../../styles/colors';
import { Row } from '../layout';
import HolyTreasure from '@holyheld-com/assets/holy_treasury.png';
import { magicMemo } from '@holyheld-com/utils';
import ShadowStack from 'react-native-shadow-stack';

const LockIcon = styled(FastImage).attrs(() => ({
  resizeMode: FastImage.resizeMode.contain,
  source: HolyTreasure,
}))`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  margin-left: 3;
  margin-top: 3;
`;

const Container = styled(Row)`
  flex: 1;
  flex-shrink: 1;
  flex-grow: 0;
  align-items: flex-end;
`;

const LockDefaultShadow = [
  [0, 4, 6, colors.dark, 0.04],
  [0, 1, 3, colors.dark, 0.08],
];

const TreasuryIcon = ({ size = 35 }) => {
  return (
    <Container>
      <ShadowStack
        {...borders.buildCircleAsObject(size + 5)}
        backgroundColor="#000"
        opacity={1}
        shadows={LockDefaultShadow}
      >
        <LockIcon height={size} width={size} />
      </ShadowStack>
    </Container>
  );
};

export default magicMemo(TreasuryIcon, []);
