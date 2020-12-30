import React from 'react';
import styled from 'styled-components/primitives';
import { magicMemo } from '../../utils';
import Divider from '../Divider';
import { CoinIcon } from '../coin-icon';
import { Centered } from '../layout';
import { Text } from '../text';
import { colors } from '@rainbow-me/styles';

const BodyText = styled(Text).attrs({
  align: 'center',
  color: colors.blueGreyDark50,
  lineHeight: 'looser',
  size: 'large',
})`
  padding-bottom: 30;
`;

const TreasurySheetEmptyState = () => {
  return (
    <Centered direction="column" paddingTop={9}>
      <CoinIcon size={50} symbol="USD" />
      <BodyText>You have no treasury to claim.</BodyText>
      <Divider color={colors.rowDividerLight} inset={[0, 42]} />
    </Centered>
  );
};

export default magicMemo(TreasurySheetEmptyState, 'isReadOnlyWallet');
