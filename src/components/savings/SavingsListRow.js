import analytics from '@segment/analytics-react-native';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { InteractionManager, StyleSheet } from 'react-native';

import styled from 'styled-components/primitives';
import { greaterThan } from '../../helpers/utilities';
import { useNavigation } from '../../navigation/Navigation';
import Routes from '../../navigation/routesNames';
import {
  SavingsSheetEmptyHeight,
  SavingsSheetHeight,
} from '../../screens/HolySavingsSheet';

import APYPill from '../APYPill';
import { ButtonPressAnimation } from '../animations';
import { Centered, InnerBorder, Row, RowWithMargins } from '../layout';
import { GradientText, Text } from '../text';
import SavingsIcon from './SavingsIcon';
import { useDimensions } from '@holyheld-com/hooks';
import { colors, padding, position } from '@holyheld-com/styles';
import ShadowStack from 'react-native-shadow-stack';

const ButtonBorderRadius = 15;

const SavingsListRowShadows = [
  [0, 10, 30, colors.dark, 0.2],
  [0, 5, 15, colors.dark, 0.4],
];

const sx = StyleSheet.create({
  button: {
    ...position.centeredAsObject,
    backgroundColor: colors.buttonPrimary,
    borderRadius: ButtonBorderRadius,
    height: 30,
    paddingBottom: 1,
    paddingRight: 2,
    width: 97,
  },
});

const NOOP = () => undefined;

const centGradientProps = {
  end: { x: 1, y: 1 },
  start: { x: 0, y: 0 },
  steps: [0, 1],
};

const SavingsListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    backgroundColor: colors.sectionItemBackground,
    borderRadius: 49,
    height: 49,
    shadows: SavingsListRowShadows,
    width: deviceWidth - 38,
  })
)``;

const SavingsListRow = ({ totalBalance, currentSaving, savings }) => {
  const { width: deviceWidth } = useDimensions();
  const { navigate } = useNavigation();

  useEffect(() => {
    if (
      currentSaving.underlying &&
      currentSaving.underlying.symbol &&
      currentSaving.balance
    )
      InteractionManager.runAfterInteractions(() => {
        analytics.track('User has savings', {
          category: 'savings',
          label: currentSaving.underlying.symbol,
        });
      });
  }, [currentSaving]);

  const { displayedDollars, displayedCents, isEmpty } = useMemo(() => {
    const isEmpty = !greaterThan(totalBalance, '0');
    let displayValue = '0.00';
    if (isEmpty) {
      displayValue = new BigNumber(totalBalance).toFixed(2);
    } else {
      displayValue = new BigNumber(totalBalance).toFormat(8);
    }
    const [displayedDollars, displayedCents] = displayValue.split('.');

    return {
      displayedCents,
      displayedDollars,
      isEmpty,
    };
  }, [totalBalance]);

  const onButtonPress = useCallback(() => {
    navigate(Routes.SAVINGS_SHEET, {
      currentSaving: currentSaving,
      lifetimeAccruedInterest: 0.1,
      longFormHeight: isEmpty ? SavingsSheetEmptyHeight : SavingsSheetHeight,
      savings: savings,
      totalBalance: totalBalance,
    });
  }, [currentSaving, navigate, savings, totalBalance, isEmpty]);

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
              <Text
                color={isEmpty ? colors.textColorMuted : colors.textColor}
                letterSpacing="roundedTightest"
                size="lmedium"
                weight="bold"
              >
                {`$${displayedDollars}`}
              </Text>
              <GradientText
                color={isEmpty ? colors.textColorMuted : colors.green}
                letterSpacing="roundedTightest"
                {...centGradientProps}
                size="lmedium"
                weight="bold"
                width="auto"
              >
                {`.${displayedCents}`}
              </GradientText>
              {isEmpty && (
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
                    Deposit
                  </Text>
                  <InnerBorder radius={ButtonBorderRadius} />
                </ButtonPressAnimation>
              )}
            </Row>

            <APYPill value={currentSaving.apy} />
          </Row>
        </SavingsListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

SavingsListRow.propTypes = {
  currentSaving: PropTypes.object,
  savings: PropTypes.array,
  totalBalance: PropTypes.string,
};

export default React.memo(SavingsListRow);
