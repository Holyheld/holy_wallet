import React from 'react';
import { Centered, ColumnWithMargins } from '../layout';
import { Emoji, Text } from '../text';
import { colors } from '@rainbow-me/styles';
import { neverRerender } from '@rainbow-me/utils';

const NoResults = () => (
  <ColumnWithMargins centered margin={3}>
    <Centered>
      <Emoji lineHeight="none" name="ghost" size={42} />
    </Centered>
    <Text color={colors.textColor} size="lmedium" weight="medium">
      Nothing here!
    </Text>
  </ColumnWithMargins>
);

export default neverRerender(NoResults);
