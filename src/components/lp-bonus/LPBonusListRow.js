import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import styled from 'styled-components/primitives';

import { greaterThan } from '../../helpers/utilities';
import { useHolyBonusRate } from '../../hooks/useHolySavings';
import Routes from '../../navigation/routesNames';
import { SheetHeight } from '../../screens/LPBonusSheet';
import APYPill from '../APYPill';
import { ButtonPressAnimation } from '../animations';
import { CoinIcon } from '../coin-icon';
import { Centered, InnerBorder, Row, RowWithMargins } from '../layout';
import { Text } from '../text';
import { useDimensions } from '@holyheld-com/hooks';
import { useNavigation } from '@holyheld-com/navigation';
import { colors, padding, position } from '@holyheld-com/styles';
import ShadowStack from 'react-native-shadow-stack';

const LPBonusListRowShadows = [
  [0, 10, 30, colors.shadowDarker, 0.2],
  [0, 5, 15, colors.shadowDarker, 0.4],
];

const NOOP = () => undefined;
const ButtonBorderRadius = 15;

const sx = StyleSheet.create({
  button: {
    ...position.centeredAsObject,
    backgroundColor: colors.apyPillBackground,
    borderRadius: ButtonBorderRadius,
    height: 30,
    paddingBottom: 1,
    paddingRight: 2,
    width: 97,
  },
});

const LPBonusListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    backgroundColor: colors.sectionItemBackground,
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

  const disabled = true;

  const { displayedBalance, isEmpty } = useMemo(() => {
    const isEmpty = !greaterThan(balance, '0');
    let displayedBalance = '0.00';
    if (isEmpty) {
      displayedBalance = new BigNumber(balance).toFixed(2);
    } else {
      displayedBalance = new BigNumber(balance).decimalPlaces(8).toString();
    }
    return {
      displayedBalance,
      isEmpty,
    };
  }, [balance]);

  const onButtonPress = useCallback(() => {
    if (!disabled && !isEmpty) {
      navigate(Routes.LP_BONUS_SHEET, {
        balance: balance,
        lifetimeSupplyInterestAccrued: '0',
        longFormHeight: SheetHeight,
      });
    }
  }, [navigate, isEmpty, disabled, balance]);

  return (
    <ButtonPressAnimation
      onPress={onButtonPress}
      overflowMargin={10}
      scaleTo={0.96}
    >
      <Centered direction="column" marginBottom={15}>
        <LPBonusListRowShadowStack deviceWidth={deviceWidth}>
          <Row
            align="center"
            css={padding(9, 10, 10, 20)}
            justify="space-around"
            onPress={() => {}}
            scaleTo={0.96}
          >
            {!isEmpty && (
              <Centered>
                <CoinIcon
                  address={underlying.address}
                  size={26}
                  symbol={underlying.symbol}
                />
              </Centered>
            )}

            <RowWithMargins
              align="center"
              flexGrow={1}
              margin={8}
              paddingLeft={4}
            >
              <Text
                color={isEmpty ? colors.textColorMuted : colors.textColor}
                letterSpacing="roundedTightest"
                size="lmedium"
                weight="bold"
              >
                {displayedBalance} HH
              </Text>
              {isEmpty && (
                <ButtonPressAnimation
                  onPress={NOOP}
                  scaleTo={0.9}
                  style={sx.button}
                >
                  <Text
                    color={colors.textColor}
                    letterSpacing="roundedTight"
                    size="lmedium"
                    weight="semibold"
                  >
                    Pending
                  </Text>
                  <InnerBorder radius={ButtonBorderRadius} />
                </ButtonPressAnimation>
              )}
            </RowWithMargins>
            <APYPill postfix="% DPY" value={bonusRate} />
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
