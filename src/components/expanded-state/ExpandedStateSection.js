import React from 'react';
import styled from 'styled-components/primitives';
import { ColumnWithMargins } from '../layout';
import { Text } from '../text';
import { colors, padding } from '@holyheld-com/styles';

const Container = styled(ColumnWithMargins).attrs({
  margin: 12,
})`
  ${padding(android ? 10 : 19, 19, android ? 12 : 24)};
`;

export default function ExpandedStateSection({
  children,
  title,
  color = colors.textColorDescription,
  ...props
}) {
  return (
    <Container {...props}>
      <Text letterSpacing="roundedTight" size="larger" weight="bold">
        {title}
      </Text>
      {typeof children === 'string' ? (
        <Text color={color} lineHeight="paragraphSmall" size="lmedium">
          {children}
        </Text>
      ) : (
        children
      )}
    </Container>
  );
}
