import React from 'react';
import { magicMemo } from '../../../utils';
import { Row } from '../../layout';
import { Text } from '../../text';
import { colors } from '@holyheld-com/styles';

const DetailsRow = ({ label, value, ...props }) => (
  <Row {...props} align="center" justify="space-between">
    <Text color={colors.textColor} flex={0} size="lmedium">
      {label}
    </Text>
    <Text
      align="right"
      color={colors.textColorMuted}
      letterSpacing="roundedTight"
      size="lmedium"
    >
      {value}
    </Text>
  </Row>
);

export default magicMemo(DetailsRow, ['label', 'value']);
