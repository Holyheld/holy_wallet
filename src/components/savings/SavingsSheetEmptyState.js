import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo } from 'react';
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
import Routes from '@holyheld-com/routes';
import { colors, padding } from '@holyheld-com/styles';

const APYHeadingText = styled(Text).attrs({
  size: 'big',
  weight: 'bold',
})``;

const BodyText = styled(Text).attrs({
  align: 'center',
  color: colors.textColor,
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

const SavingsSheetEmptyState = ({ isReadOnlyWallet, apy }) => {
  const { navigate } = useNavigation();

  const disableDeposit = false;

  const { displayedApy } = useMemo(() => {
    const displayedApy = new BigNumber(apy).decimalPlaces(2).toString();
    return {
      displayedApy,
    };
  }, [apy]);

  const onDeposit = useCallback(() => {
    if (disableDeposit) {
      return;
    }
    if (!isReadOnlyWallet) {
      navigate(Routes.HOLY_SAVINGS_DEPOSIT_MODAL, {
        params: {
          screen: Routes.MAIN_EXCHANGE_SCREEN,
        },
        screen: Routes.MAIN_EXCHANGE_NAVIGATOR,
      });
    } else {
      Alert.alert(`You need to import the wallet in order to do this`);
    }
  }, [isReadOnlyWallet, navigate, disableDeposit]);

  return (
    <Centered direction="column" paddingTop={9}>
      <SavingsIcon size={51} withPair />
      <Centered marginBottom={12} marginTop={15}>
        <APYHeadingText>Get </APYHeadingText>
        <GradientAPYHeadingText>{displayedApy}%</GradientAPYHeadingText>
        <APYHeadingText> on your assets</APYHeadingText>
      </Centered>
      <BodyText>
        With the digital protocol like <Br />
        Yearn.finance, your money is <Br />
        earning you more than ever before
      </BodyText>
      <Divider
        backgroundColor={colors.modalBackground}
        color={colors.divider}
        inset={[0, 42]}
      />
      <ColumnWithMargins css={padding(19, 15)} margin={19} width="100%">
        <SheetActionButton
          color={disableDeposit ? colors.buttonDisabled : colors.buttonPrimary}
          disabled={disableDeposit}
          fullWidth
          label="􀁍 Deposit from Wallet"
          onPress={onDeposit}
          size="big"
          textColor={colors.textColorPrimaryButton}
        />
      </ColumnWithMargins>
    </Centered>
  );
};

export default magicMemo(SavingsSheetEmptyState, 'isReadOnlyWallet');
