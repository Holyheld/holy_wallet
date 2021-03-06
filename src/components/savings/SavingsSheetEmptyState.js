import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/primitives';
import { useNavigation } from '../../navigation/Navigation';
import { magicMemo } from '../../utils';
import Divider from '../Divider';
//import { CoinIcon } from '../coin-icon';
import { Centered, ColumnWithMargins } from '../layout';
import { SheetActionButton } from '../sheet';
import { Br, GradientText, Text } from '../text';
import SavingsIcon from './SavingsIcon';
import Routes from '@rainbow-me/routes';
import { colors, padding } from '@rainbow-me/styles';

const APYHeadingText = styled(Text).attrs({
  size: 'big',
  weight: 'bold',
})``;

const BodyText = styled(Text).attrs({
  align: 'center',
  color: colors.blueGreyDark50,
  lineHeight: 'looser',
  size: 'large',
})`
  padding-bottom: 10;
`;

const GradientAPYHeadingText = styled(GradientText).attrs({
  align: 'center',
  angle: false,
  end: { x: 1, y: 1 },
  renderer: APYHeadingText,
  start: { x: 0, y: 0 },
  steps: [0, 1],
})``;

const SavingsSheetEmptyState = ({ isReadOnlyWallet, apy, underlying }) => {
  const { navigate } = useNavigation();

  const onDeposit = useCallback(() => {
    if (!isReadOnlyWallet) {
      navigate(Routes.SAVINGS_DEPOSIT_MODAL, {
        params: {
          params: {
            defaultInputAsset: underlying,
          },
          screen: Routes.MAIN_EXCHANGE_SCREEN,
        },
        screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
      });
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [isReadOnlyWallet, navigate, underlying]);

  return (
    <Centered direction="column" paddingTop={9}>
      <SavingsIcon />
      <Centered marginBottom={12} marginTop={15}>
        <APYHeadingText>Get </APYHeadingText>
        <GradientAPYHeadingText>{apy}%</GradientAPYHeadingText>
        <APYHeadingText> on your assets</APYHeadingText>
      </Centered>
      <BodyText>
        With digital protocol like <Br />
        Yearn.finance, your money is <Br />
        earning you more than ever before
      </BodyText>
      <Divider color={colors.rowDividerLight} inset={[0, 42]} />
      <ColumnWithMargins css={padding(19, 15)} margin={19} width="100%">
        <SheetActionButton
          color={colors.swapPurple}
          fullWidth
          label="􀁍 Deposit from Wallet"
          onPress={onDeposit}
          size="big"
        />
        {/*
          <SheetActionButton
            color={colors.white}
            label="Deposit with Pay"
            onPress={() => navigate(Routes.SAVINGS_DEPOSIT_MODAL)}
            size="big"
            textColor={colors.dark}
          />
        */}
      </ColumnWithMargins>
    </Centered>
  );
};

export default magicMemo(SavingsSheetEmptyState, 'isReadOnlyWallet');
