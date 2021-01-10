import { get } from 'lodash';
import React, { Fragment, useCallback } from 'react';
import { Linking } from 'react-native';
import styled from 'styled-components/primitives';
import networkInfo from '../helpers/networkInfo';
import networkTypes from '../helpers/networkTypes';
import showWalletErrorAlert from '../helpers/support';
import { useDimensions, useWallets } from '../hooks';
import { magicMemo } from '../utils';
import Divider from './Divider';
import { ButtonPressAnimation } from './animations';
import { Icon } from './icons';
import { Centered, Row, RowWithMargins } from './layout';
import { Text } from './text';
import { useNavigation } from '@rainbow-me/navigation';
import Routes from '@rainbow-me/routes';
import { colors, padding } from '@rainbow-me/styles';

const ButtonContainerHeight = 400;
const ButtonContainerWidth = 261;

const ButtonContainer = styled(Centered).attrs({ direction: 'column' })`
  width: ${ButtonContainerWidth};
`;

const InterstitialButton = styled(ButtonPressAnimation).attrs({
  backgroundColor: colors.alpha(colors.buttonPrimary, 0.2),
  borderRadius: 23,
})`
  ${padding(10.5, 15, 14.5)};
`;

const InterstitialDivider = styled(Divider).attrs({
  color: colors.divider,
  inset: [0, 0, 0, 0],
})`
  border-radius: 1;
`;

const CopyAddressButton = styled(ButtonPressAnimation).attrs({
  backgroundColor: colors.alpha(colors.buttonPrimary, 0.2),
  borderRadius: 23,
})`
  ${padding(10.5, 15, 14.5)};
`;

const Container = styled(Centered)`
  left: 50%;
  position: absolute;
  top: 50%;
`;

const Paragraph = styled(Text).attrs({
  align: 'center',
  color: colors.textColorMuted,
  letterSpacing: 'roundedMedium',
  lineHeight: 'paragraphSmall',
  size: 'lmedium',
  weight: 'semibold',
})`
  margin-bottom: 24;
  margin-top: 19;
`;

const Title = styled(Text).attrs({
  align: 'center',
  lineHeight: 32,
  size: 'bigger',
  weight: 'heavy',
})`
  margin-horizontal: 27;
`;

const Subtitle = styled(Title)`
  margin-top: ${({ isSmallPhone }) => (isSmallPhone ? 19 : 42)};
`;

const buildInterstitialTransform = (isSmallPhone, offsetY) => ({
  transform: [
    { translateX: (ButtonContainerWidth / 2) * -1 },
    {
      translateY:
        (ButtonContainerHeight / 2) * -1 +
        offsetY -
        (android ? 66 : isSmallPhone ? 44 : 22),
    },
  ],
});

const onAddFromFaucet = network => {
  const faucetUrl = get(networkInfo[network], 'faucet_url');
  Linking.openURL(faucetUrl);
};

const AddFundsInterstitial = ({ network, offsetY = 0 }) => {
  const { isSmallPhone } = useDimensions();
  const { navigate } = useNavigation();
  const { isDamaged } = useWallets();

  const handlePressCopyAddress = useCallback(() => {
    if (isDamaged) {
      showWalletErrorAlert();
      return;
    }
    navigate(Routes.RECEIVE_MODAL);
  }, [navigate, isDamaged]);

  return (
    <Container style={buildInterstitialTransform(isSmallPhone, offsetY)}>
      <ButtonContainer>
        {network === networkTypes.mainnet ? (
          <Fragment>
            <Title>Fund your wallet with ETH</Title>
            <Paragraph>
              Send from Coinbase or another exchange—or ask a friend!
            </Paragraph>
          </Fragment>
        ) : (
          <Fragment>
            <Title>
              Request test ETH through the {get(networkInfo[network], 'name')}{' '}
              faucet
            </Title>
            <Row marginBottom={10} marginTop={30}>
              <InterstitialButton onPress={() => onAddFromFaucet(network)}>
                <Text
                  align="center"
                  color={colors.textColorPrimary}
                  lineHeight="loose"
                  size="large"
                  weight="bold"
                >
                  􀎬 Add from faucet
                </Text>
              </InterstitialButton>
            </Row>
            {!isSmallPhone && <InterstitialDivider />}
            <Subtitle isSmallPhone={isSmallPhone}>
              or send test ETH to your wallet
            </Subtitle>

            <Paragraph>
              Send test ETH from another {get(networkInfo[network], 'name')}{' '}
              wallet—or ask a friend!
            </Paragraph>
          </Fragment>
        )}
        <CopyAddressButton
          onPress={handlePressCopyAddress}
          radiusAndroid={23}
          testID="copy-address-button"
        >
          <RowWithMargins margin={6}>
            <Icon
              color={colors.textColorPrimary}
              marginTop={0.5}
              name="copy"
              size={19}
            />
            <Text
              align="center"
              color={colors.textColorPrimary}
              lineHeight="loose"
              size="large"
              weight="bold"
            >
              Copy address
            </Text>
          </RowWithMargins>
        </CopyAddressButton>
      </ButtonContainer>
    </Container>
  );
};

export default magicMemo(AddFundsInterstitial, ['network', 'offsetY']);
