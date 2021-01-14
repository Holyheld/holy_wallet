import React, { Fragment } from 'react';
import ReactCoinIcon from 'react-coin-icon';
import { magicMemo } from '../../utils';
import CoinIconFallback from './CoinIconFallback';
import CoinIconIndicator from './CoinIconIndicator';
import { borders, colors } from '@rainbow-me/styles';
import ShadowStack from 'react-native-shadow-stack';

export const CoinIconSize = 40;

const defaultShadow = [
  [0, 10, 30, colors.shadowDarker, 0.2],
  [0, 5, 15, colors.shadowDarker, 0.4],
];

const CoinIcon = ({
  address,
  bgColor = colors.skeletonColor,
  isHidden,
  isPinned,
  showShadow = true,
  size = CoinIconSize,
  shadow = defaultShadow,
  symbol,
  ...props
}) =>
  showShadow ? (
    <Fragment>
      {isPinned || isHidden ? <CoinIconIndicator isPinned={isPinned} /> : null}
      <ShadowStack
        {...props}
        {...borders.buildCircleAsObject(size)}
        backgroundColor={bgColor}
        opacity={isHidden ? 0.4 : 1}
        shadows={shadow}
      >
        <ReactCoinIcon
          address={address || ''}
          bgColor={bgColor}
          fallbackRenderer={CoinIconFallback}
          size={size}
          symbol={symbol || ''}
        />
      </ShadowStack>
    </Fragment>
  ) : (
    <ReactCoinIcon
      {...props}
      address={address || ''}
      bgColor={bgColor}
      fallbackRenderer={CoinIconFallback}
      size={size}
      symbol={symbol}
    />
  );

export default magicMemo(CoinIcon, [
  'address',
  'bgColor',
  'isHidden',
  'isPinned',
  'size',
  'symbol',
]);
