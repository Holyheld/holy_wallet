import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import styled from 'styled-components/primitives';
import { add, greaterThan, multiply } from '../../helpers/utilities';
import Routes from '../../navigation/routesNames';
import { getUSDCAsset } from '../../references/holy';
import {
  SavingsSheetEmptyHeight,
  SavingsSheetHeight,
} from '../../screens/HolySavingsSheet';

import APYPill from '../APYPill';
import { ButtonPressAnimation } from '../animations';
import { Centered, InnerBorder, Row, RowWithMargins } from '../layout';
import { Text } from '../text';
import SavingsIcon from './SavingsIcon';
import SavingsListRowAnimatedNumber from './SavingsListRowAnimatedNumber';
import { useAccountSettings, useDimensions } from '@holyheld-com/hooks';
import { useNavigation } from '@holyheld-com/navigation';
import { colors, padding, position, shadow } from '@holyheld-com/styles';
import ShadowStack from 'react-native-shadow-stack';

const ButtonBorderRadius = 15;

const SavingsListRowShadows = [
  [0, 10, 30, colors.dark, 0.2],
  [0, 5, 15, colors.dark, 0.4],
];

const sx = StyleSheet.create({
  button: {
    ...position.centeredAsObject,
    ...shadow.buildAsObject(0, 4, 6, colors.buttonPrimary, 0.6),
    backgroundColor: colors.buttonPrimary,
    borderRadius: ButtonBorderRadius,
    height: 30,
    marginLeft: 10,
    paddingBottom: 1,
    paddingRight: 2,
    width: 97,
  },
});

const NOOP = () => undefined;

const ANIMATE_NUMBER_INTERVAL = 60;

const SavingsListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    backgroundColor: colors.sectionItemBackground,
    borderRadius: 49,
    height: 49,
    shadows: SavingsListRowShadows,
    width: deviceWidth - 38,
  })
)``;

const HolySavingsListRow = ({ totalBalance, savings }) => {
  const { width: deviceWidth } = useDimensions();
  const { navigate } = useNavigation();

  const { network } = useAccountSettings();

  const { apy, dpy } = savings;

  const usdcAsset = getUSDCAsset(network);

  const { isEmpty, displayedApy } = useMemo(() => {
    const isEmpty = !greaterThan(totalBalance, '0');
    let displayValue = '0.00';
    if (isEmpty) {
      displayValue = new BigNumber(totalBalance).toFixed(2);
    } else {
      displayValue = new BigNumber(totalBalance).toFormat(8);
    }
    const [displayedDollars, displayedCents] = displayValue.split('.');

    const displayedApy = new BigNumber(apy).decimalPlaces(2).toString();

    return {
      displayedApy,
      displayedCents,
      displayedDollars,
      isEmpty,
    };
  }, [totalBalance, apy]);

  const onButtonPress = useCallback(() => {
    navigate(Routes.SAVINGS_SHEET, {
      longFormHeight: isEmpty ? SavingsSheetEmptyHeight : SavingsSheetHeight,
    });
  }, [navigate, isEmpty]);

  const valueFactor = useMemo(() => multiply(totalBalance, add(1, dpy)), [
    dpy,
    totalBalance,
  ]);

  return (
    <ButtonPressAnimation
      onPress={onButtonPress}
      overflowMargin={10}
      scaleTo={0.96}
    >
      <Centered direction="column" marginBottom={15}>
        <SavingsListRowShadowStack deviceWidth={deviceWidth}>
          <Row
            align="center"
            css={padding(9, 10, 10, 20)}
            justify="space-around"
            onPress={() => {}}
            scaleTo={0.96}
          >
            {!isEmpty && (
              <RowWithMargins width={31}>
                <SavingsIcon size={23} />
              </RowWithMargins>
            )}
            <Row align="center" flexGrow={3} paddingLeft={4}>
              {isEmpty ? (
                <>
                  <Text
                    color={colors.textColorMuted}
                    letterSpacing="roundedTightest"
                    size="lmedium"
                    weight="bold"
                  >
                    $0.00
                  </Text>
                  <ButtonPressAnimation
                    onPress={NOOP}
                    scaleTo={0.9}
                    style={sx.button}
                  >
                    <Text
                      color={colors.textColorPrimaryButton}
                      letterSpacing="roundedTight"
                      size="lmedium"
                      weight="semibold"
                    >
                      􀁍 Deposit
                    </Text>
                    <InnerBorder radius={ButtonBorderRadius} />
                  </ButtonPressAnimation>
                </>
              ) : (
                // <GradientText
                //   letterSpacing="roundedTightest"
                //   {...centGradientProps}
                //   size="lmedium"
                //   weight="bold"
                //   width="auto"
                // >
                //   {`.${displayedCents}`}
                // </GradientText>
                <SavingsListRowAnimatedNumber
                  initialValue={totalBalance}
                  interval={ANIMATE_NUMBER_INTERVAL}
                  symbol={usdcAsset.symbol}
                  value={valueFactor}
                />
              )}
            </Row>

            <APYPill value={displayedApy} />
          </Row>
        </SavingsListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

HolySavingsListRow.propTypes = {
  savings: PropTypes.object,
  totalBalance: PropTypes.string,
};

export default React.memo(HolySavingsListRow);
