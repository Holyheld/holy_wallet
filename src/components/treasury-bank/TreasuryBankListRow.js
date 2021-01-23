import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import styled from 'styled-components/primitives';
import { greaterThan } from '../../helpers/utilities';
import { useNavigation } from '../../navigation/Navigation';

import Routes from '../../navigation/routesNames';
import APYPill from '../APYPill';
import { ButtonPressAnimation } from '../animations';
import { Centered, InnerBorder, Row, RowWithMargins } from '../layout';
import { GradientText, Text } from '../text';
import TreasuryIcon from './TreasuryIcon';
import { useDimensions } from '@holyheld-com/hooks';
import { colors, padding, position, shadow } from '@holyheld-com/styles';
import ShadowStack from 'react-native-shadow-stack';

const NOOP = () => undefined;
const ButtonBorderRadius = 15;

const TreasuryBankListRowShadows = [
  [0, 10, 30, colors.dark, 0.2],
  [0, 5, 15, colors.dark, 0.4],
];

const centGradientProps = {
  end: { x: 1, y: 1 },
  start: { x: 0, y: 0 },
  steps: [0, 1],
};

const sx = StyleSheet.create({
  button: {
    ...position.centeredAsObject,
    ...shadow.buildAsObject(0, 4, 6, colors.buttonPrimary, 0.4),
    backgroundColor: colors.buttonPrimary,
    borderRadius: ButtonBorderRadius,
    height: 30,
    marginLeft: 10,
    paddingBottom: 1,
    paddingRight: 2,
    width: 97,
  },
});

const TreasuryBankListRowShadowStack = styled(ShadowStack).attrs(
  ({ deviceWidth }) => ({
    backgroundColor: colors.sectionItemBackground,
    borderRadius: 49,
    height: 49,
    shadows: TreasuryBankListRowShadows,
    width: deviceWidth - 38,
  })
)``;

const TreasuryBankListRow = ({ treasury }) => {
  const { width: deviceWidth } = useDimensions();
  const { navigate } = useNavigation();

  const balance = treasury.balance;

  const { displayedDollars, displayedCents, isEmpty } = useMemo(() => {
    const isEmpty = !greaterThan(balance, '0');
    let displayedBalance = '0.00';
    if (isEmpty) {
      displayedBalance = new BigNumber(balance).toFixed(2);
    } else {
      displayedBalance = new BigNumber(balance).toFormat(8);
    }
    const [displayedDollars, displayedCents] = displayedBalance.split('.');
    return {
      displayedCents,
      displayedDollars,
      isEmpty,
    };
  }, [balance]);

  const onButtonPress = useCallback(() => {
    if (!isEmpty) {
      navigate(Routes.TREASURY_SHEET, {
        balance: balance,
      });
    }
  }, [navigate, isEmpty, balance]);

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
            justify="space-around"
            onPress={NOOP}
            scaleTo={0.96}
          >
            {!isEmpty && (
              <RowWithMargins width={31}>
                <TreasuryIcon size={23} />
              </RowWithMargins>
            )}
            <Row flexGrow={3} justify="start" paddingLeft={4}>
              <Text
                color={isEmpty ? colors.textColorMuted : colors.textColor}
                letterSpacing="roundedTightest"
                size="lmedium"
                weight="bold"
                width="auto"
              >
                {`$${displayedDollars}`}
              </Text>

              {isEmpty ? (
                <Text
                  color={colors.textColorMuted}
                  letterSpacing="roundedTightest"
                  size="lmedium"
                  weight="bold"
                >
                  {`.${displayedCents}`}
                </Text>
              ) : (
                <GradientText
                  letterSpacing="roundedTightest"
                  {...centGradientProps}
                  size="lmedium"
                  weight="bold"
                  width="auto"
                >
                  {`.${displayedCents}`}
                </GradientText>
              )}
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
                    􀁍 Boost
                  </Text>
                  <InnerBorder radius={ButtonBorderRadius} />
                </ButtonPressAnimation>
              )}
            </Row>
            <APYPill postfix="x" value={treasury.rate} />
          </Row>
        </TreasuryBankListRowShadowStack>
      </Centered>
    </ButtonPressAnimation>
  );
};

TreasuryBankListRow.propTypes = {
  treasury: PropTypes.object,
};

export default React.memo(TreasuryBankListRow);
