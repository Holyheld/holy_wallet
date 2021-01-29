import BigNumber from 'bignumber.js';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import styled from 'styled-components/primitives';

import { greaterThan } from '../../helpers/utilities';
import { useHolyEarlyLPBonus } from '../../hooks/useHolyData';
import Routes from '../../navigation/routesNames';
import { getHHAsset } from '../../references/holy';
import { SheetHeight } from '../../screens/LPBonusSheet';
import APYPill from '../APYPill';
import { ButtonPressAnimation } from '../animations';
import { CoinIcon } from '../coin-icon';
import { Centered, InnerBorder, Row, RowWithMargins } from '../layout';
import { Text } from '../text';
import { useAccountSettings, useDimensions } from '@holyheld-com/hooks';
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

const LPBonusListRow = () => {
  const { width: deviceWidth } = useDimensions();
  const { navigate } = useNavigation();
  const { network } = useAccountSettings();
  const HHAsset = getHHAsset(network);

  const { amountToClaim, dpy } = useHolyEarlyLPBonus();

  const disabled = false;

  const { displayedBalance, isEmpty, displayedDpy } = useMemo(() => {
    const isEmpty = !greaterThan(amountToClaim, '0');
    let displayedBalance = '0.00';
    if (isEmpty) {
      displayedBalance = new BigNumber(amountToClaim).toFixed(2);
    } else {
      displayedBalance = new BigNumber(amountToClaim)
        .decimalPlaces(8)
        .toString();
    }
    const displayedDpy = new BigNumber(dpy).decimalPlaces(2).toString();
    return {
      displayedBalance,
      displayedDpy,
      isEmpty,
    };
  }, [amountToClaim, dpy]);

  const onButtonPress = useCallback(() => {
    if (!disabled && !isEmpty) {
      navigate(Routes.LP_BONUS_SHEET, {
        longFormHeight: SheetHeight,
      });
    }
  }, [navigate, isEmpty, disabled]);

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
                  address={HHAsset.address}
                  size={26}
                  symbol={HHAsset.symbol}
                />
              </Centered>
            )}

            <RowWithMargins
              align="center"
              flexGrow={1}
              margin={8}
              paddingLeft={12}
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
            <APYPill postfix="% DPY" value={displayedDpy} />
          </Row>
        </LPBonusListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

export default React.memo(LPBonusListRow);
