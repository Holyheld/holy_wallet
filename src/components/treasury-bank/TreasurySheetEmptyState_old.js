import React from 'react';
import styled from 'styled-components/primitives';
import { magicMemo } from '../../utils';
import Divider from '../Divider';
import { CoinIcon } from '../coin-icon';
import { Centered } from '../layout';
import { Text } from '../text';
import { colors } from '@holyheld-com/styles';

const BodyText = styled(Text).attrs({
  align: 'center',
  color: colors.textColor,
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
      <Divider
        backgroundColor={colors.modalBackground}
        color={colors.divider}
        inset={[0, 42]}
      />
    </Centered>
  );
};

export default magicMemo(TreasurySheetEmptyState, 'isReadOnlyWallet');