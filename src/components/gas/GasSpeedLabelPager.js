import React, { useEffect, useState } from 'react';
import styled from 'styled-components/primitives';
import { Row } from '../layout';
import GasSpeedLabelPagerItem, {
  GasSpeedLabelPagerItemHeight,
} from './GasSpeedLabelPagerItem';
import { colors } from '@holyheld-com/styles';
import { gasUtils, magicMemo } from '@holyheld-com/utils';

const speedColors = [
  colors.textColor,
  colors.textColor,
  colors.textColor,
  colors.textColorPrimary,
];

const PagerItem = styled(Row)`
  width: ${({ selected }) => (selected ? '4' : '3')}px;
  height: 3px;
  border-radius: 2px;
  margin-left: ${({ selected }) => (selected ? '2' : '2.5')}px;
  margin-right: ${({ selected }) => (selected ? '0' : '0.5')}px;
  ${android ? `margin-top: -3px;` : ``}
`;

const GasSpeedLabelPager = ({
  label,
  theme,
  showPager = true,
  options = null,
}) => {
  const [touched, setTouched] = useState(false);
  useEffect(() => setTouched(true), [label]);

  return (
    <Row align="center" height={GasSpeedLabelPagerItemHeight} justify="end">
      {showPager && (
        <Row self="start">
          {(options || gasUtils.GasSpeedOrder).map((speed, i) => (
            <PagerItem
              backgroundColor={
                speed === label ? speedColors[i] : colors.buttonSecondary
              }
              key={`pager-${speed}-${i}`}
              selected={speed === label}
            />
          ))}
        </Row>
      )}
      <Row height={GasSpeedLabelPagerItemHeight}>
        {gasUtils.GasSpeedOrder.map(speed => (
          <GasSpeedLabelPagerItem
            key={speed}
            label={speed}
            selected={speed === label}
            shouldAnimate={touched}
            theme={theme}
          />
        ))}
      </Row>
    </Row>
  );
};

export default magicMemo(GasSpeedLabelPager, 'label');
