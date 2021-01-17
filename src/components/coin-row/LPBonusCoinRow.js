import BigNumber from 'bignumber.js';
import React, { Fragment, useMemo } from 'react';
import styled from 'styled-components/primitives';
import APYPill from '../APYPill';
import { ButtonPressAnimation } from '../animations';
import { CoinIcon } from '../coin-icon';
import { Column, FlexItem, Row, RowWithMargins } from '../layout';
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

const Content = styled(Column).attrs({ justify: 'space-between' })`
  flex: 1;
  height: ${CoinIconSize};
  margin-left: 10;
  opacity: ${({ isHidden }) => (isHidden ? 0.4 : 1)};
`;

const BottomRow = ({ share }) => {
  return (
    <Fragment>
      <APYPill postfix="x" small value={share} />
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
        HH
      </CoinName>
    </FlexItem>
    <BalanceText>{balance + ' ' + symbol}</BalanceText>
  </Row>
);

const LPBonusCoinRow = ({ balance, symbol, share }) => {
  const diplayedBalance = useMemo(() => new BigNumber(balance).toFixed(8), [
    balance,
  ]);

  return (
    <ButtonPressAnimation disabled onPress={() => {}} scaleTo={1.02}>
      <Container>
        <CoinIcon size={45} symbol={symbol} />
        <Content justify="center">
          <Row align="center" {...(android && { styles: { height: 50 } })}>
            <TopRow balance={diplayedBalance} symbol={symbol} />
          </Row>
          <Row align="center" marginBottom={0.5}>
            <BottomRow share={share} symbol={symbol} />
          </Row>
        </Content>
      </Container>
    </ButtonPressAnimation>
  );
};

export default LPBonusCoinRow;
