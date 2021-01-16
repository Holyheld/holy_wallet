import React from 'react';
import FastImage from 'react-native-fast-image';
import styled from 'styled-components/primitives';
import borders from '../../styles/borders';
import colors from '../../styles/colors';
import { Row } from '../layout';
import HolyCash from '@rainbow-me/assets/holy_cash.png';
import SavingPair from '@rainbow-me/assets/saving-pair.png';
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

const SavingPairIcon = styled(FastImage).attrs(() => ({
  resizeMode: FastImage.resizeMode.contain,
  source: SavingPair,
}))`
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  margin-left: 3;
  margin-top: 4;
`;

const Container = styled(Row)`
  flex: 1;
  flex-shrink: 1;
  flex-grow: 0;
  align-items: flex-end;
`;

const DollarDefaultShadow = [
  [0, 4, 6, colors.dark, 0.04],
  [0, 1, 3, colors.dark, 0.08],
];

const SavingsIcon = ({ size = 35, withPair = false }) => {
  const pairWidth = size - 30;
  return (
    <Container>
      <ShadowStack
        {...borders.buildCircleAsObject(size + 5)}
        backgroundColor="#000"
        opacity={1}
        shadows={DollarDefaultShadow}
      >
        <DollarIcon height={size} width={size} />
      </ShadowStack>
      {withPair && (
        <ShadowStack
          style={{ marginLeft: -18 }}
          {...borders.buildCircleAsObject(pairWidth + 5)}
          backgroundColor="#000"
          opacity={1}
          shadows={DollarDefaultShadow}
        >
          <SavingPairIcon height={pairWidth} width={pairWidth} />
        </ShadowStack>
      )}
    </Container>
  );
};

export default magicMemo(SavingsIcon, []);
