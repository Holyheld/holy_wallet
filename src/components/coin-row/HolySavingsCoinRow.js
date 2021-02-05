import React from 'react';
import styled from 'styled-components/primitives';
import { ButtonPressAnimation } from '../animations';
import { Column, FlexItem, Row, RowWithMargins } from '../layout';
import { APYPill } from '../savings';
import SavingsIcon from '../savings/SavingsIcon';
import { Text } from '../text';
import BalanceText from './BalanceText';
import CoinName from './CoinName';
import { colors, padding } from '@holyheld-com/styles';

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

const Content = styled(Column).attrs({ justify: 'space-around' })`
  flex: 1;
  margin-left: 10;
  opacity: ${({ isHidden }) => (isHidden ? 0.4 : 1)};
`;

const BottomRow = ({ apy, additionalShare, symbol }) => {
  return (
    <RowWithMargins marginLeft={1}>
      <APYPill
        backgroundColor={colors.apyPillBackgroundLighter}
        small
        value={apy}
      />
      <RowWithMargins flex={1} margin={4}>
        <Column flex={1}>
          <Text
            align="right"
            color={colors.green}
            flex={1}
            size="smedium"
            weight="semibold"
          >
            􀁍 {additionalShare + ' ' + symbol}
          </Text>
        </Column>
      </RowWithMargins>
    </RowWithMargins>
  );
};

const TopRow = ({ balance, symbol }) => (
  <Row align="center" justify="space-between" marginBottom={android ? 0 : 5}>
    <FlexItem flex={1}>
      <CoinName letterSpacing="roundedMedium" weight="semibold">
        Savings
      </CoinName>
    </FlexItem>
    <BalanceText>{balance + ' ' + symbol}</BalanceText>
  </Row>
);

const HolySavingsCoinRow = ({ balance, symbol, apy, additionalShare }) => (
  <ButtonPressAnimation disabled onPress={() => {}} scaleTo={1.02}>
    <Container>
      <RowWithMargins marginRight={5} width={39}>
        <SavingsIcon size={39} />
      </RowWithMargins>

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
