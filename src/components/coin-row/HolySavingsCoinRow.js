import React, { Fragment } from 'react';
import styled from 'styled-components/primitives';
import { ButtonPressAnimation } from '../animations';
import { Column, FlexItem, Row, RowWithMargins } from '../layout';
import { APYPill } from '../savings';
import { Emoji, Text } from '../text';
import BalanceText from './BalanceText';
import CoinName from './CoinName';
import { colors, padding } from '@rainbow-me/styles';

const CoinIconSize = 50;
const CoinRowPaddingTop = 9;
const CoinRowPaddingBottom = 10;
export const CoinRowHeight =
  CoinIconSize + CoinRowPaddingTop + CoinRowPaddingBottom;

const Container = styled(Row).attrs({
  align: 'center',
  grow: 0,
  shrink: 1,
})`
  ${padding(CoinRowPaddingTop, 19, CoinRowPaddingBottom)};
  width: 100%;
`;

const Content = styled(Column).attrs({ justify: 'space-between' })`
  flex: 1;
  height: ${CoinIconSize};
  margin-left: 10;
  opacity: ${({ isHidden }) => (isHidden ? 0.4 : 1)};
`;

const BottomRow = ({ apy, additionalShare }) => {
  return (
    <Fragment>
      <APYPill small value={apy} />
      <RowWithMargins flex={1} margin={4}>
        <Column flex={1}>
          <Text
            align="right"
            color={colors.green}
            flex={1}
            size="smedium"
            weight="semibold"
          >
            {' '}
            {'$' + additionalShare}
          </Text>
        </Column>
      </RowWithMargins>
    </Fragment>
  );
};

const TopRow = ({ balance, symbol }) => (
  <Row align="center" justify="space-between" marginBottom={2}>
    <FlexItem flex={1}>
      <CoinName letterSpacing="roundedMedium" weight="semibold">
        {symbol}
      </CoinName>
    </FlexItem>
    <BalanceText>{'$' + balance}</BalanceText>
  </Row>
);

const HolySavingsCoinRow = ({ balance, symbol, apy, additionalShare }) => (
  <ButtonPressAnimation disabled onPress={() => {}} scaleTo={1.02}>
    <Container>
      <Emoji name="flag_united_states" size={25} />
      <Content justify="center">
        <Row align="center" {...(android && { styles: { height: 50 } })}>
          <TopRow balance={balance} symbol={symbol} />
        </Row>
        <Row align="center" marginBottom={0.5}>
          <BottomRow
            additionalShare={additionalShare}
            apy={apy}
            symbol={symbol}
          />
        </Row>
      </Content>
    </Container>
  </ButtonPressAnimation>
);

export default HolySavingsCoinRow;
