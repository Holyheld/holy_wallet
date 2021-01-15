import React from 'react';
import FastImage from 'react-native-fast-image';
import styled from 'styled-components/primitives';
import borders from '../../styles/borders';
import colors from '../../styles/colors';
import HolyCash from '@rainbow-me/assets/holy_cash.png';
import { magicMemo } from '@rainbow-me/utils';
import ShadowStack from 'react-native-shadow-stack';

const DollarIcon = styled(FastImage).attrs(() => ({
  resizeMode: FastImage.resizeMode.contain,
  source: HolyCash,
}))`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  margin-left: 3;
  margin-top: 3;
`;

const DollarDefaultShadow = [
  [0, 4, 6, colors.dark, 0.04],
  [0, 1, 3, colors.dark, 0.08],
];

const SavingsIcon = ({ size = 35 }) => {
  return (
    <ShadowStack
      {...borders.buildCircleAsObject(size + 5)}
      backgroundColor="#000"
      opacity={1}
      shadows={DollarDefaultShadow}
    >
      <DollarIcon height={size} width={size} />
    </ShadowStack>
  );
};

export default magicMemo(SavingsIcon, []);
