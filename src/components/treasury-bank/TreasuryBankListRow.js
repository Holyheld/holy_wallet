import React, { useCallback } from 'react';
import styled from 'styled-components/primitives';
import { useNavigation } from '../../navigation/Navigation';

import Routes from '../../navigation/routesNames';
import { ButtonPressAnimation } from '../animations';
import { Centered, Row, RowWithMargins } from '../layout';
import { Emoji, Text } from '../text';
import APYPill from './APYPill';
import { useDimensions } from '@rainbow-me/hooks';
import { colors, padding } from '@rainbow-me/styles';
import ShadowStack from 'react-native-shadow-stack';

const TreasuryBankListRowShadows = [
  [0, 10, 30, colors.dark, 0.2],
  [0, 5, 15, colors.dark, 0.4],
];

const TreasuryBankListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    borderRadius: 49,
    height: 49,
    shadows: TreasuryBankListRowShadows,
    width: deviceWidth - 38,
  })
)``;

const TreasuryBankListRow = () => {
  const { width: deviceWidth } = useDimensions();
  const { navigate } = useNavigation();

  const balance = '10.00';

  const onButtonPress = useCallback(() => {
    //console.log('GO TO TREASURY');
    navigate(Routes.TREASURY_SHEET, {
      balance: balance,
      lifetimeSupplyInterestAccrued: '10',
    });
  }, [navigate]);

  return (
    <ButtonPressAnimation
      onPress={onButtonPress}
      overflowMargin={10}
      scaleTo={0.96}
    >
      <Centered direction="column" marginBottom={15}>
        <TreasuryBankListRowShadowStack deviceWidth={deviceWidth}>
          <Row
            align="center"
            css={padding(9, 10, 10, 20)}
            justify="space-between"
            onPress={() => {}}
            scaleTo={0.96}
          >
            <Centered>
              <Emoji lineHeight="none" name="flag_united_states" size={20} />
            </Centered>
            <RowWithMargins align="center" margin={8} paddingLeft={4}>
              <Text
                color={colors.textColor}
                letterSpacing="roundedTightest"
                opacity={0.5}
                size="lmedium"
                weight="bold"
              >
                {`$${balance}`}
              </Text>
            </RowWithMargins>
            <APYPill value="22" />
          </Row>
        </TreasuryBankListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

// TreasuryBankListRow.propTypes = {
//   underlying: PropTypes.object,
//   userBalance: PropTypes.string,
// };

export default React.memo(TreasuryBankListRow);
