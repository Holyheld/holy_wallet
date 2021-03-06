import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/primitives';

import { useHolyBonusRate } from '../../hooks/useHolySavings';
import { useNavigation } from '../../navigation/Navigation';
import Routes from '../../navigation/routesNames';
import { ButtonPressAnimation } from '../animations';
import { CoinIcon } from '../coin-icon';
import { Centered, Row, RowWithMargins } from '../layout';
import { Text } from '../text';
import APYPill from './APYPill';
import { useDimensions } from '@rainbow-me/hooks';
import { colors, padding, position } from '@rainbow-me/styles';
import ShadowStack from 'react-native-shadow-stack';

const LPBonusListRowShadows = [
  [0, 10, 30, colors.dark, 0.1],
  [0, 5, 15, colors.dark, 0.04],
];

const neverRerender = () => true;
// eslint-disable-next-line react/display-name
const LPBonusListRowGradient = React.memo(
  () => (
    <LinearGradient
      borderRadius={49}
      colors={['#FFFFFF', '#F7F9FA']}
      end={{ x: 0.5, y: 1 }}
      pointerEvents="none"
      start={{ x: 0.5, y: 0 }}
      style={position.coverAsObject}
    />
  ),
  neverRerender
);

const LPBonusListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    borderRadius: 49,
    height: 49,
    shadows: LPBonusListRowShadows,
    width: deviceWidth - 38,
  })
)``;

const LPBonusListRow = ({ balance, underlying }) => {
  const { width: deviceWidth } = useDimensions();
  const { navigate } = useNavigation();

  const { bonusRate } = useHolyBonusRate();

  const onButtonPress = useCallback(() => {
    navigate(Routes.LP_BONUS_SHEET, {
      balance: balance,
      lifetimeSupplyInterestAccrued: '0',
    });
  }, [navigate, balance]);

  const diplayedBalance = useMemo(() => new BigNumber(balance).toFixed(8), [
    balance,
  ]);

  return (
    <ButtonPressAnimation
      onPress={onButtonPress}
      overflowMargin={10}
      scaleTo={0.96}
    >
      <Centered direction="column" marginBottom={15}>
        <LPBonusListRowShadowStack deviceWidth={deviceWidth}>
          <LPBonusListRowGradient />
          <Row
            align="center"
            css={padding(9, 10, 10, 20)}
            justify="space-between"
            onPress={() => {}}
            scaleTo={0.96}
          >
            <Centered>
              <CoinIcon
                address={underlying.address}
                size={26}
                symbol={underlying.symbol}
              />
            </Centered>
            <RowWithMargins align="center" margin={8} paddingLeft={4}>
              <Text
                color={colors.blueGreyDark}
                letterSpacing="roundedTightest"
                opacity={0.5}
                size="lmedium"
                weight="bold"
              >
                {diplayedBalance} HH
              </Text>
            </RowWithMargins>
            <APYPill value={bonusRate} />
          </Row>
        </LPBonusListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

LPBonusListRow.propTypes = {
  balance: PropTypes.string,
  underlying: PropTypes.object,
};

export default React.memo(LPBonusListRow);
